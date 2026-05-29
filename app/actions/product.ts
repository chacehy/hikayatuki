"use server";

import { supabase } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase-server";
import { verifyPermission } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

/**
 * Public action: Fetches product by ID including category details and all associated product images.
 */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, sub_category:sub_categories(*, main_category:main_categories(*)), product_images(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by id:", error);
    return null;
  }
  return data;
}

/**
 * Admin action: Fetches all products (including hidden ones) for management.
 */
export async function getProducts() {
  const staff = await verifyPermission("can_manage_inventory");
  const client = staff ? await getSupabaseServer() : supabase;

  const { data, error } = await client
    .from("products")
    .select("*, sub_category:sub_categories(*, main_category:main_categories(*))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

/**
 * Public action: Fetches visible products in a sub-category.
 */
export async function getProductsBySubCategory(subCategoryId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, sub_category:sub_categories(*, main_category:main_categories(*))")
    .eq("sub_category_id", subCategoryId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by sub category:", error);
    return [];
  }
  return data || [];
}

/**
 * Public action: Fetches visible products in a main category.
 */
export async function getProductsByMainCategory(mainCategoryId: string) {
  // First get all sub_category ids for this main category
  const { data: subCats, error: scError } = await supabase
    .from("sub_categories")
    .select("id")
    .eq("main_category_id", mainCategoryId);

  if (scError || !subCats || subCats.length === 0) {
    return [];
  }

  const subCatIds = subCats.map((sc: any) => sc.id);

  const { data, error } = await supabase
    .from("products")
    .select("*, sub_category:sub_categories(*, main_category:main_categories(*))")
    .in("sub_category_id", subCatIds)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by main category:", error);
    return [];
  }
  return data || [];
}

/**
 * Admin action: Adds a new product with multiple images and detailed descriptive fields.
 */
export async function addProduct(formData: FormData) {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    return { success: false, error: "Non autorisé. Droits d'inventaire requis." };
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const isVisible = formData.get("isVisible") === "true";
    const subCategoryId = formData.get("sub_category_id") as string | null;

    // Expanded descriptive fields
    const detailedDescription = formData.get("detailed_description") as string;
    const careInstructions = formData.get("care_instructions") as string;
    const flowerType = formData.get("flower_type") as string;
    const sizes = formData.get("sizes") as string;

    // Handle multiple photo uploads
    const photos = formData.getAll("photos") as File[];
    const uploadedUrls: string[] = [];

    const client = await getSupabaseServer();

    for (const photo of photos) {
      if (photo && photo.size > 0) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // CRITICAL BUGFIX: Convert file to ArrayBuffer & Buffer to prevent Next.js Server Action upload hanging
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await client.storage
          .from("products")
          .upload(fileName, buffer, {
            contentType: photo.type,
            duplex: "half",
          });

        if (uploadError) {
          console.error("Storage upload error for file:", photo.name, uploadError);
          return { success: false, error: `Erreur lors de l'envoi de l'image : ${photo.name}` };
        }

        const { data: publicUrlData } = client.storage
          .from("products")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null;

    // Insert primary product record
    const { data: productData, error: insertError } = await client
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          is_visible: isVisible,
          image_url: mainImageUrl,
          sub_category_id: subCategoryId || null,
          detailed_description: detailedDescription || null,
          care_instructions: careInstructions || null,
          flower_type: flowerType || null,
          sizes: sizes || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return { success: false, error: "Erreur lors de l'ajout du produit dans la base de données." };
    }

    // Insert all uploaded image URLs into product_images table
    if (uploadedUrls.length > 0 && productData) {
      const imageRows = uploadedUrls.map((url, index) => ({
        product_id: productData.id,
        image_url: url,
        display_order: index,
      }));

      const { error: imagesError } = await client
        .from("product_images")
        .insert(imageRows);

      if (imagesError) {
        console.error("Error inserting product images:", imagesError);
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Add product error:", err);
    return { success: false, error: "Une erreur inattendue s'est produite lors de la création du produit." };
  }
}

/**
 * Admin action: Deletes a product.
 */
export async function deleteProduct(id: string) {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    return { success: false, error: "Non autorisé." };
  }

  const client = await getSupabaseServer();
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Erreur lors de la suppression." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

/**
 * Admin action: Toggles product visibility on shop.
 */
export async function toggleProductVisibility(id: string, isVisible: boolean) {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    return { success: false, error: "Non autorisé." };
  }

  const client = await getSupabaseServer();
  const { error } = await client
    .from("products")
    .update({ is_visible: isVisible })
    .eq("id", id);

  if (error) {
    console.error("Toggle visibility error:", error);
    return { success: false, error: "Erreur lors de la modification." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

/**
 * Admin action: Updates the custom tag label and background color of a product.
 */
export async function updateProductTag(
  id: string,
  tagLabel: string | null,
  tagBgColor: string | null
) {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    return { success: false, error: "Non autorisé. Droits d'inventaire requis." };
  }

  const client = await getSupabaseServer();
  const { error } = await client
    .from("products")
    .update({
      tag_label: tagLabel || null,
      tag_bg_color: tagBgColor || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Update product tag error:", error);
    return { success: false, error: "Erreur lors de la mise à jour du tag." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}
