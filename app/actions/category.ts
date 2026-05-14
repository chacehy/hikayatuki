"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ── Read Operations ──

export async function getMainCategories() {
  const { data, error } = await supabase
    .from("main_categories")
    .select("*, sub_categories(*)") 
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching main categories:", error);
    return [];
  }

  // Sort sub_categories within each main category
  return (data || []).map((mc: any) => ({
    ...mc,
    sub_categories: (mc.sub_categories || []).sort(
      (a: any, b: any) => a.display_order - b.display_order
    ),
  }));
}

export async function getSubCategories(mainCategoryId?: string) {
  let query = supabase
    .from("sub_categories")
    .select("*, main_category:main_categories(*)")
    .order("display_order", { ascending: true });

  if (mainCategoryId) {
    query = query.eq("main_category_id", mainCategoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sub categories:", error);
    return [];
  }
  return data || [];
}

export async function getComposableSubCategories() {
  const { data, error } = await supabase
    .from("sub_categories")
    .select("*, main_category:main_categories(*)")
    .eq("is_composable", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching composable sub categories:", error);
    return [];
  }
  return data || [];
}

// ── Main Category CRUD ──

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createMainCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) return { success: false, error: "Le nom est requis." };

    const slug = slugify(name);

    // Get max display_order
    const { data: existing } = await supabase
      .from("main_categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;

    const { error } = await supabase.from("main_categories").insert([
      { name, slug, display_order: nextOrder },
    ]);

    if (error) {
      console.error("Create main category error:", error);
      return { success: false, error: "Erreur lors de la création." };
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function updateMainCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    if (!name) return { success: false, error: "Le nom est requis." };

    const slug = slugify(name);

    const { error } = await supabase
      .from("main_categories")
      .update({ name, slug })
      .eq("id", id);

    if (error) {
      console.error("Update main category error:", error);
      return { success: false, error: "Erreur lors de la mise à jour." };
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function deleteMainCategory(id: string) {
  const { error } = await supabase.from("main_categories").delete().eq("id", id);

  if (error) {
    console.error("Delete main category error:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

// ── Sub Category CRUD ──

export async function createSubCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const mainCategoryId = formData.get("main_category_id") as string;
    const isComposable = formData.get("is_composable") === "true";

    if (!name || !mainCategoryId) {
      return { success: false, error: "Nom et catégorie parent requis." };
    }

    const slug = slugify(name);

    // Get max display_order within this parent
    const { data: existing } = await supabase
      .from("sub_categories")
      .select("display_order")
      .eq("main_category_id", mainCategoryId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;

    const { error } = await supabase.from("sub_categories").insert([
      {
        name,
        slug,
        main_category_id: mainCategoryId,
        is_composable: isComposable,
        display_order: nextOrder,
      },
    ]);

    if (error) {
      console.error("Create sub category error:", error);
      return { success: false, error: "Erreur lors de la création." };
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function updateSubCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const isComposable = formData.get("is_composable") === "true";

    if (!name) return { success: false, error: "Le nom est requis." };

    const slug = slugify(name);

    const { error } = await supabase
      .from("sub_categories")
      .update({ name, slug, is_composable: isComposable })
      .eq("id", id);

    if (error) {
      console.error("Update sub category error:", error);
      return { success: false, error: "Erreur lors de la mise à jour." };
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Erreur inattendue." };
  }
}

export async function deleteSubCategory(id: string) {
  const { error } = await supabase.from("sub_categories").delete().eq("id", id);

  if (error) {
    console.error("Delete sub category error:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleComposable(id: string, isComposable: boolean) {
  const { error } = await supabase
    .from("sub_categories")
    .update({ is_composable: isComposable })
    .eq("id", id);

  if (error) {
    console.error("Toggle composable error:", error);
    return { success: false, error: "Erreur lors de la modification." };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}
