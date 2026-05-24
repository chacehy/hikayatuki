"use server";

import { supabase } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

/**
 * Verifies if the current logged-in user has a specific permission.
 * Returns the staff record if permitted, otherwise null.
 */
export async function verifyPermission(
  permission?: "can_manage_inventory" | "can_view_orders" | "can_manage_yalidine"
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  if (!userId) return null;

  const client = await getSupabaseServer();
  const { data: staff, error } = await client
    .from("staff_members")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !staff) return null;

  // Main Admin bypasses all checks
  if (staff.role === "main_admin") return staff;

  // Check granular permission if requested
  if (permission && !staff[permission]) return null;

  return staff;
}

/**
 * Handles staff/admin login and sets cookies.
 */
export async function loginAction(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: "Identifiants incorrects ou compte inexistant." };
    }

    // Verify the user exists in staff_members table
    const { data: staff, error: staffError } = await supabase
      .from("staff_members")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (staffError || !staff) {
      // SELF-HEALING: Check if this is the first user in the database
      const { count } = await supabase
        .from("staff_members")
        .select("*", { count: "exact", head: true });

      if (count === 0 && data.session) {
        // Auto-create the main_admin record using the authenticated user's client to bypass RLS restriction
        const userClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          {
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
            auth: { persistSession: false },
          }
        );

        const { error: insertError } = await userClient.from("staff_members").insert([{
          id: data.user.id,
          email: data.user.email,
          role: "main_admin",
          can_manage_inventory: true,
          can_view_orders: true,
          can_manage_yalidine: true,
        }]);

        if (insertError) {
          console.error("Self-healing insert error:", insertError);
          return { success: false, error: "Erreur d'initialisation du compte administrateur: " + insertError.message };
        }
      } else {
        // If no staff member record, sign out and deny access
        const tempClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          { auth: { persistSession: false } }
        );
        await tempClient.auth.signOut();
        return { success: false, error: "Accès refusé. Compte non autorisé." };
      }
    }

    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });
    cookieStore.set("session_user_id", data.user.id, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });

    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}

/**
 * Handles registration for the first admin or requesting accounts.
 */
export async function signUpAction(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Impossible de créer l'utilisateur." };
    }

    // Determine role: first staff member becomes main_admin, others get staff
    const { count } = await supabase
      .from("staff_members")
      .select("*", { count: "exact", head: true });

    const isFirstUser = (count ?? 0) === 0;
    const role = isFirstUser ? "main_admin" : "staff";

    // Create the staff_members record for this new user using authenticated client if session is active
    const clientToUse = data.session
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          {
            global: {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
            auth: { persistSession: false },
          }
        )
      : supabase;

    const { error: staffInsertError } = await clientToUse
      .from("staff_members")
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          role,
          can_manage_inventory: isFirstUser,
          can_view_orders: isFirstUser,
          can_manage_yalidine: isFirstUser,
        },
      ]);

    if (staffInsertError) {
      console.error("Staff insert error:", staffInsertError);
      // Don't fail the whole signup – the auth user was created, staff record
      // can be added manually later by main admin
    }

    // If Supabase returned a session (email confirmation disabled), log in directly
    if (data.session) {
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        maxAge: data.session.expires_in,
      });
      cookieStore.set("session_user_id", data.user.id, {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "lax",
        maxAge: data.session.expires_in,
      });
      return { success: true };
    }

    // If email confirmation is required, don't try to log in yet
    return {
      success: true,
      needsConfirmation: true,
    };
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}

/**
 * Clears cookies and signs out.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("session_user_id");
  
  const client = await getSupabaseServer();
  await client.auth.signOut();
}

/**
 * Retrieves the list of all staff members (Main Admin only).
 */
export async function getStaffMembers() {
  const admin = await verifyPermission();
  if (!admin || admin.role !== "main_admin") {
    throw new Error("Action non autorisée.");
  }

  const client = await getSupabaseServer();
  const { data, error } = await client
    .from("staff_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch staff members error:", error);
    return [];
  }

  return data || [];
}

/**
 * Updates permissions for a specific staff member (Main Admin only).
 */
export async function updateStaffPermissions(
  staffId: string,
  updates: {
    can_manage_inventory: boolean;
    can_view_orders: boolean;
    can_manage_yalidine: boolean;
  }
) {
  const admin = await verifyPermission();
  if (!admin || admin.role !== "main_admin") {
    return { success: false, error: "Action non autorisée." };
  }

  const client = await getSupabaseServer();
  const { error } = await client
    .from("staff_members")
    .update(updates)
    .eq("id", staffId);

  if (error) {
    console.error("Update staff error:", error);
    return { success: false, error: "Erreur lors de la mise à jour." };
  }

  revalidatePath("/admin/team");
  return { success: true };
}

/**
 * Deletes a staff member (Main Admin only).
 */
export async function deleteStaffMember(staffId: string) {
  const admin = await verifyPermission();
  if (!admin || admin.role !== "main_admin") {
    return { success: false, error: "Action non autorisée." };
  }

  const client = await getSupabaseServer();
  // RLS and triggers will protect the main admin from being deleted
  const { error } = await client
    .from("staff_members")
    .delete()
    .eq("id", staffId);

  if (error) {
    console.error("Delete staff error:", error);
    return { success: false, error: error.message || "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/team");
  return { success: true };
}

/**
 * Registers a new staff member directly from the Team Management dashboard
 * without altering the currently logged in Main Admin's session.
 */
export async function addStaffMember(email: string, password: string) {
  const admin = await verifyPermission();
  if (!admin || admin.role !== "main_admin") {
    return { success: false, error: "Action non autorisée." };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    // Create an independent client to avoid changing the Main Admin session cookies
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: signUpData, error } = await tempClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (signUpData.user) {
      const client = await getSupabaseServer();
      const { error: staffInsertError } = await client
        .from("staff_members")
        .insert([{
          id: signUpData.user.id,
          email: signUpData.user.email,
          role: "staff",
          can_manage_inventory: false,
          can_view_orders: true, // Default to true so they can see orders
          can_manage_yalidine: false,
        }]);

      if (staffInsertError) {
        console.error("Failed to insert staff member record:", staffInsertError);
        return { success: false, error: "Compte créé mais impossible d'enregistrer les permissions." };
      }
    }

    revalidatePath("/admin/team");
    return { success: true };
  } catch (err) {
    console.error("Add staff member error:", err);
    return { success: false, error: "Une erreur s'est produite lors de l'ajout." };
  }
}
