"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ── Read Operations ──

export async function getRawMaterials() {
  const { data, error } = await supabase
    .from("raw_materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching raw materials:", error);
    return [];
  }
  return data || [];
}

export async function getRawMaterialsBySubCategory(subCategoryId: string) {
  const { data, error } = await supabase
    .from("sub_category_materials")
    .select("raw_material:raw_materials(*)")
    .eq("sub_category_id", subCategoryId);

  if (error) {
    console.error("Error fetching materials for sub category:", error);
    return [];
  }

  return (data || [])
    .map((row: any) => row.raw_material)
    .filter((m: any) => m && m.is_visible);
}

export async function getMaterialLinks(rawMaterialId: string) {
  const { data, error } = await supabase
    .from("sub_category_materials")
    .select("sub_category_id")
    .eq("raw_material_id", rawMaterialId);

  if (error) {
    console.error("Error fetching material links:", error);
    return [];
  }
  return (data || []).map((row: any) => row.sub_category_id);
}

// ── CRUD Operations ──

export async function createRawMaterial(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const photo = formData.get("photo") as File | null;

    if (!name) return { success: false, error: "Le nom est requis." };

    let imageUrl = null;

    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, photo);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Erreur lors de l'envoi de l'image." };
      }

      const { data: publicUrlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("raw_materials").insert([
      { name, description, price, image_url: imageUrl },
    ]);

    if (error) {
      console.error("Create raw material error:", error);
      return { success: false, error: "Erreur lors de la création." };
    }

    revalidatePath("/admin/materials");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function updateRawMaterial(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const photo = formData.get("photo") as File | null;

    if (!name) return { success: false, error: "Le nom est requis." };

    const updates: any = { name, description, price };

    if (photo && photo.size > 0) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, photo);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Erreur lors de l'envoi de l'image." };
      }

      const { data: publicUrlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      updates.image_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("raw_materials")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Update raw material error:", error);
      return { success: false, error: "Erreur lors de la mise à jour." };
    }

    revalidatePath("/admin/materials");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function deleteRawMaterial(id: string) {
  const { error } = await supabase.from("raw_materials").delete().eq("id", id);

  if (error) {
    console.error("Delete raw material error:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function toggleRawMaterialVisibility(id: string, isVisible: boolean) {
  const { error } = await supabase
    .from("raw_materials")
    .update({ is_visible: isVisible })
    .eq("id", id);

  if (error) {
    console.error("Toggle visibility error:", error);
    return { success: false, error: "Erreur lors de la modification." };
  }

  revalidatePath("/admin/materials");
  return { success: true };
}

// ── Link / Unlink Operations ──

export async function linkMaterialToSubCategory(
  rawMaterialId: string,
  subCategoryId: string
) {
  const { error } = await supabase.from("sub_category_materials").insert([
    { raw_material_id: rawMaterialId, sub_category_id: subCategoryId },
  ]);

  if (error) {
    console.error("Link material error:", error);
    return { success: false, error: "Erreur lors du lien." };
  }

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function unlinkMaterialFromSubCategory(
  rawMaterialId: string,
  subCategoryId: string
) {
  const { error } = await supabase
    .from("sub_category_materials")
    .delete()
    .eq("raw_material_id", rawMaterialId)
    .eq("sub_category_id", subCategoryId);

  if (error) {
    console.error("Unlink material error:", error);
    return { success: false, error: "Erreur lors de la suppression du lien." };
  }

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function updateMaterialLinks(
  rawMaterialId: string,
  subCategoryIds: string[]
) {
  // Delete all existing links
  const { error: deleteError } = await supabase
    .from("sub_category_materials")
    .delete()
    .eq("raw_material_id", rawMaterialId);

  if (deleteError) {
    console.error("Delete links error:", deleteError);
    return { success: false, error: "Erreur lors de la mise à jour des liens." };
  }

  // Insert new links
  if (subCategoryIds.length > 0) {
    const rows = subCategoryIds.map((scId) => ({
      raw_material_id: rawMaterialId,
      sub_category_id: scId,
    }));

    const { error: insertError } = await supabase
      .from("sub_category_materials")
      .insert(rows);

    if (insertError) {
      console.error("Insert links error:", insertError);
      return { success: false, error: "Erreur lors de la mise à jour des liens." };
    }
  }

  revalidatePath("/admin/materials");
  return { success: true };
}
