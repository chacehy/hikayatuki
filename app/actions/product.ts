"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

export async function addProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const isVisible = formData.get("isVisible") === "true";
    const photo = formData.get("photo") as File | null;

    let photoUrl = null;

    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, photo);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Erreur lors de l'envoi de l'image." };
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      photoUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("products").insert([
      {
        name,
        description,
        price,
        is_visible: isVisible,
        image_url: photoUrl,
      },
    ]);

    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: "Erreur lors de l'ajout du produit." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Add product error:", err);
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  const { error } = await supabase
    .from("products")
    .update({ is_visible: isVisible })
    .eq("id", id);

  if (error) {
    console.error("Toggle visibility error:", error);
    return { success: false, error: "Erreur lors de la modification." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
