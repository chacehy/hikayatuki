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
      // If no staff member record, sign out and deny access
      const tempClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        { auth: { persistSession: false } }
      );
      await tempClient.auth.signOut();
      return { success: false, error: "Accès refusé. Compte non autorisé." };
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

    // Try logging the user in to set cookies immediately
    return await loginAction(email, password);
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

    const { error } = await tempClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/team");
    return { success: true };
  } catch (err) {
    console.error("Add staff member error:", err);
    return { success: false, error: "Une erreur s'est produite lors de l'ajout." };
  }
}
