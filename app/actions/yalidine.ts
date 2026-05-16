"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import {
  fetchWilayas,
  fetchCommunes,
  fetchCenters,
  fetchDeliveryFees,
  createParcel,
  getParcelByTracking,
} from "@/lib/yalidine";
import type { YalidineParcelCreate } from "@/lib/yalidine";

// ══════════════════════════════════════════════════
// SEED: Fetch from Yalidine API and store in Supabase
// Run once, then periodically to keep data fresh
// ══════════════════════════════════════════════════

export async function seedYalidineData() {
  try {
    console.log("[Yalidine Seed] Starting...");

    // 1. Fetch & upsert wilayas
    const wilayas = await fetchWilayas();
    console.log(`[Yalidine Seed] Fetched ${wilayas.length} wilayas`);

    if (wilayas.length > 0) {
      const wilayaRows = wilayas.map((w: any) => ({
        id: w.id,
        name: w.name,
        ar_name: w.ar_name || null,
        code: w.code || w.zone?.toString() || null,
        has_stop_desk: !!w.has_stop_desk,
        is_deliverable: w.is_deliverable === 1 || w.is_deliverable === true,
      }));

      // Upsert in batches of 100
      for (let i = 0; i < wilayaRows.length; i += 100) {
        const batch = wilayaRows.slice(i, i + 100);
        const { error } = await supabase
          .from("yalidine_wilayas")
          .upsert(batch, { onConflict: "id" });
        if (error) {
          console.error("[Yalidine Seed] Wilayas upsert error:", error);
          return { success: false, error: `Wilayas: ${error.message}` };
        }
      }
    }

    // 2. Fetch & upsert communes
    const communes = await fetchCommunes();
    console.log(`[Yalidine Seed] Fetched ${communes.length} communes`);

    if (communes.length > 0) {
      const communeRows = communes.map((c: any) => ({
        id: c.id,
        name: c.name,
        ar_name: c.ar_name || null,
        wilaya_id: c.wilaya_id,
        has_stop_desk: !!c.has_stop_desk,
        is_deliverable: c.is_deliverable === 1 || c.is_deliverable === true,
      }));

      for (let i = 0; i < communeRows.length; i += 100) {
        const batch = communeRows.slice(i, i + 100);
        const { error } = await supabase
          .from("yalidine_communes")
          .upsert(batch, { onConflict: "id" });
        if (error) {
          console.error("[Yalidine Seed] Communes upsert error:", error);
          return { success: false, error: `Communes: ${error.message}` };
        }
      }
    }

    // 3. Fetch & upsert centers
    const centers = await fetchCenters();
    console.log(`[Yalidine Seed] Fetched ${centers.length} centers`);

    if (centers.length > 0) {
      const centerRows = centers.map((c: any) => ({
        center_id: c.center_id,
        name: c.name,
        commune_id: c.commune_id || null,
        wilaya_id: c.wilaya_id || null,
        address: c.address || null,
        gps: c.gps || null,
        phone: c.phone || null,
        is_center: !!c.is_center,
        has_stop_desk: !!c.has_stop_desk,
      }));

      for (let i = 0; i < centerRows.length; i += 100) {
        const batch = centerRows.slice(i, i + 100);
        const { error } = await supabase
          .from("yalidine_centers")
          .upsert(batch, { onConflict: "center_id" });
        if (error) {
          console.error("[Yalidine Seed] Centers upsert error:", error);
          return { success: false, error: `Centers: ${error.message}` };
        }
      }
    }

    // 4. Fees are fetched on-demand per wilaya pair via getDeliveryFeeFromAPI()
    // The /fees endpoint requires from_wilaya_id + to_wilaya_id, so we can't pre-cache.

    console.log("[Yalidine Seed] Done ✓");
    revalidatePath("/admin");
    revalidatePath("/admin/yalidine");
    return {
      success: true,
      counts: {
        wilayas: wilayas.length,
        communes: communes.length,
        centers: centers.length,
        fees: 0, // fetched on-demand
      },
    };
  } catch (err: any) {
    console.error("[Yalidine Seed] Error:", err);
    return { success: false, error: err.message || "Erreur inattendue." };
  }
}

// ══════════════════════════════════════════════════
// READ: Cached data from Supabase
// ══════════════════════════════════════════════════

export async function getWilayas() {
  const { data, error } = await supabase
    .from("yalidine_wilayas")
    .select("*")
    .eq("is_deliverable", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching wilayas:", error);
    return [];
  }
  return data || [];
}

export async function getCommunesByWilaya(wilayaId: number) {
  const { data, error } = await supabase
    .from("yalidine_communes")
    .select("*")
    .eq("wilaya_id", wilayaId)
    .eq("is_deliverable", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching communes:", error);
    return [];
  }
  return data || [];
}

export async function getCentersByWilaya(wilayaId: number) {
  const { data, error } = await supabase
    .from("yalidine_centers")
    .select("*")
    .eq("wilaya_id", wilayaId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching centers:", error);
    return [];
  }
  return data || [];
}

export async function getDeliveryFee(fromWilayaId: number, toWilayaId: number) {
  try {
    // Fetch fees from Yalidine API on-demand via edge function proxy
    const { fetchFeesForRoute } = await import("@/lib/yalidine");
    const fees = await fetchFeesForRoute(fromWilayaId, toWilayaId);
    return fees;
  } catch (err) {
    console.error("Error fetching delivery fee:", err);
    return null;
  }
}

// ══════════════════════════════════════════════════
// PARCEL: Create & Track via Yalidine API
// ══════════════════════════════════════════════════

export async function createYalidineParcel(orderId: string) {
  try {
    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "Commande introuvable." };
    }

    if (order.yalidine_tracking) {
      return { success: false, error: "Colis déjà créé sur Yalidine." };
    }

    // Parse name into firstname/familyname
    const nameParts = (order.full_name || "").trim().split(/\s+/);
    const firstname = nameParts[0] || "Client";
    const familyname = nameParts.slice(1).join(" ") || "Hikayatouki";

    // Build product list string
    let productList = "Commande Hikayatouki";
    if (order.items && Array.isArray(order.items)) {
      productList = order.items.map((i: any) => i.item || i.name).join(", ");
    }
    if (order.selected_materials && Array.isArray(order.selected_materials)) {
      const matNames = order.selected_materials
        .map((m: any) => `${m.name} x${m.quantity}`)
        .join(", ");
      if (matNames) productList += ` | ${matNames}`;
    }

    const parcelData: YalidineParcelCreate = {
      order_id: orderId.substring(0, 30), // max 30 chars
      firstname,
      familyname,
      contact_phone: order.phone_number || "",
      address: order.address || "",
      to_commune_name: order.commune || "",
      to_wilaya_name: order.wilaya || "",
      product_list: productList.substring(0, 255),
      price: 0, // COD amount (0 if payment is separate)
      do_insurance: false,
      declared_value: 0,
      freeshipping: 0,
      is_stopdesk: order.delivery_type === "desk" ? 1 : 0,
      stop_desk_id: order.stop_desk_id || undefined,
      has_exchange: 0,
    };

    const result = await createParcel(parcelData);

    // Update order with tracking number
    const tracking = result.tracking || result.Tracking;
    if (tracking) {
      await supabase
        .from("orders")
        .update({
          yalidine_tracking: tracking,
          yalidine_status: "En préparation",
        })
        .eq("id", orderId);
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, tracking };
  } catch (err: any) {
    console.error("Create Yalidine parcel error:", err);
    return { success: false, error: err.message || "Erreur Yalidine." };
  }
}

export async function getParcelStatus(tracking: string) {
  try {
    const data = await getParcelByTracking(tracking);
    return { success: true, data };
  } catch (err: any) {
    console.error("Get parcel status error:", err);
    return { success: false, error: err.message };
  }
}
