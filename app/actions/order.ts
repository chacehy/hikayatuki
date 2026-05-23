"use server";

import { supabase } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase-server";
import { verifyPermission } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Public action: Customer order submission.
 */
export async function submitOrder(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const itemsRaw = formData.get("items") as string;
    const photo = formData.get("photo") as File | null;
    const wilaya = formData.get("wilaya") as string;
    const commune = formData.get("commune") as string;
    const address = formData.get("address") as string;
    const orderType = (formData.get("order_type") as string) || "composer";
    const composerSubCategoryId = formData.get("composer_sub_category_id") as string;
    const selectedMaterialsRaw = formData.get("selected_materials") as string;
    const wilayaId = formData.get("wilaya_id") ? parseInt(formData.get("wilaya_id") as string) : null;
    const communeId = formData.get("commune_id") ? parseInt(formData.get("commune_id") as string) : null;
    const deliveryType = (formData.get("delivery_type") as string) || "home";
    const deliveryFee = formData.get("delivery_fee") ? parseFloat(formData.get("delivery_fee") as string) : 0;
    const stopDeskId = formData.get("stop_desk_id") ? parseInt(formData.get("stop_desk_id") as string) : null;

    if (!fullName) {
      return { success: false, error: "Le nom complet est requis." };
    }

    if (!phoneNumber) {
      return { success: false, error: "Le numéro de téléphone est requis." };
    }

    const items = itemsRaw ? JSON.parse(itemsRaw) : [];
    const selectedMaterials = selectedMaterialsRaw ? JSON.parse(selectedMaterialsRaw) : [];
    let photoUrl = null;

    // Upload photo if it exists and is an actual file with size > 0
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // BUGFIX: Convert file to ArrayBuffer and Buffer to prevent Node/Next Server Action upload hang
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, buffer, {
          contentType: photo.type,
          duplex: "half",
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Erreur lors de l'envoi de l'image." };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      photoUrl = publicUrlData.publicUrl;
    }

    // Insert order into database
    const { data, error } = await supabase.from("orders").insert([
      {
        full_name: fullName,
        phone_number: phoneNumber,
        items: items,
        photo_url: photoUrl,
        wilaya: wilaya || null,
        commune: commune || null,
        address: address || null,
        order_type: orderType,
        composer_sub_category_id: composerSubCategoryId || null,
        selected_materials: selectedMaterials,
        wilaya_id: wilayaId,
        commune_id: communeId,
        delivery_type: deliveryType,
        delivery_fee: deliveryFee,
        stop_desk_id: stopDeskId,
      },
    ]);

    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: "Erreur lors de la création de la commande." };
    }

    return { success: true };
  } catch (err) {
    console.error("Order submission error:", err);
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}

/**
 * Admin action: Confirm order status.
 */
export async function confirmOrder(formData: FormData) {
  const staff = await verifyPermission("can_view_orders");
  if (!staff) {
    throw new Error("Non autorisé. Permissions d'accès aux commandes requises.");
  }

  try {
    let orderId = "";
    for (const [key, value] of formData.entries()) {
      if (key === "orderId" || key.endsWith("_orderId")) orderId = value.toString();
    }
    
    const client = await getSupabaseServer();

    const { data: order, error: orderError } = await client
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Commande introuvable.");
    }

    const { error } = await client
      .from("orders")
      .update({ 
        status: "CONFIRMED"
      })
      .eq("id", orderId);

    if (error) {
      console.error("Confirm order error:", error);
      throw new Error("Erreur lors de la confirmation.");
    }

    revalidatePath("/admin");
    redirect("/admin");
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") throw err; // Allow Next.js redirects to propagate
    console.error(err);
    throw new Error(err.message || "Une erreur inattendue s'est produite.");
  }
}

/**
 * Admin action: Cancel order status.
 */
export async function cancelOrder(formData: FormData) {
  const staff = await verifyPermission("can_view_orders");
  if (!staff) {
    throw new Error("Non autorisé. Permissions d'accès aux commandes requises.");
  }

  try {
    let orderId = "";
    for (const [key, value] of formData.entries()) {
      if (key === "orderId" || key.endsWith("_orderId")) orderId = value.toString();
    }
    
    const client = await getSupabaseServer();

    const { error } = await client
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId);

    if (error) {
      console.error("Cancel order error:", error);
      throw new Error("Erreur lors de l'annulation.");
    }

    revalidatePath("/admin");
    redirect("/admin");
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") throw err; // Allow Next.js redirects to propagate
    throw new Error("Une erreur inattendue s'est produite.");
  }
}
