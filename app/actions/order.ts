"use server";

import { supabase } from "@/lib/supabase";

export async function submitOrder(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const itemsRaw = formData.get("items") as string;
    const photo = formData.get("photo") as File | null;

    if (!fullName) {
      return { success: false, error: "Le nom complet est requis." };
    }

    if (!phoneNumber) {
      return { success: false, error: "Le numéro de téléphone est requis." };
    }

    const items = itemsRaw ? JSON.parse(itemsRaw) : [];
    let photoUrl = null;

    // Upload photo if it exists and is an actual file with size > 0
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, photo);

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

export async function confirmOrder(orderId: string) {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: "CONFIRMED" })
      .eq("id", orderId);

    if (error) {
      console.error("Confirm order error:", error);
      return { success: false, error: "Erreur lors de la confirmation." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId);

    if (error) {
      console.error("Cancel order error:", error);
      return { success: false, error: "Erreur lors de l'annulation." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}
