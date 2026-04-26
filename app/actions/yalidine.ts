"use server";

import { Yalidine, YalidineMemoryDatabase } from "yalidine";
import { getSettings } from "./settings";

let cachedYalidine: Yalidine | null = null;
let lastKeys = "";

export async function getYalidineClient() {
  const settings = await getSettings();
  const apiId = settings["yalidine_api_id"];
  const apiToken = settings["yalidine_api_token"];

  if (!apiId || !apiToken) {
    return null; // Pas configuré
  }

  const currentKeys = `${apiId}:${apiToken}`;

  if (!cachedYalidine || lastKeys !== currentKeys) {
    cachedYalidine = new Yalidine({
      agent: "yalidine",
      auth: {
        id: apiId,
        token: apiToken,
      },
      database: new YalidineMemoryDatabase(),
    });
    // On initialise pour charger les wilayas etc.
    try {
      await cachedYalidine.init();
    } catch (e) {
      console.error("Erreur initialisation Yalidine", e);
      return null;
    }
    lastKeys = currentKeys;
  }

  return cachedYalidine;
}

export async function getWilayas() {
  const client = await getYalidineClient();
  if (!client) {
    // Mode Fallback
    return [
      { id: 16, name: "Alger" },
      { id: 9, name: "Blida" },
      { id: 31, name: "Oran" },
      { id: 25, name: "Constantine" },
      { id: 23, name: "Annaba" },
      // Juste pour le fallback de test.
    ];
  }

  try {
    const wilayas = await client.wilayas.list();
    return wilayas.map((w) => ({ id: w.id, name: w.name }));
  } catch (error) {
    console.error("Yalidine getWilayas", error);
    return [];
  }
}

export async function getCommunes(wilayaId: number) {
  const client = await getYalidineClient();
  if (!client) {
    // Mode Fallback
    if (wilayaId === 16) return [{ id: 1601, name: "Alger Centre" }, { id: 1602, name: "Bab El Oued" }, { id: 1603, name: "Hydra" }];
    if (wilayaId === 9) return [{ id: 901, name: "Blida" }, { id: 902, name: "Boufarik" }];
    if (wilayaId === 31) return [{ id: 3101, name: "Oran" }, { id: 3102, name: "Es Senia" }];
    if (wilayaId === 25) return [{ id: 2501, name: "Constantine" }, { id: 2502, name: "El Khroub" }];
    return [];
  }

  try {
    const communes = await client.communes.list({ wilaya_id: wilayaId });
    return communes.map((c) => ({ id: c.id, name: c.name }));
  } catch (error) {
    console.error("Yalidine getCommunes", error);
    return [];
  }
}

export async function createParcel(orderData: any) {
  const client = await getYalidineClient();
  if (!client) {
    console.log("Mock Mode: Création de colis simulée pour Yalidine.");
    return { tracking: "MOCK-" + Math.floor(Math.random() * 1000000) };
  }

  try {
    const parcel = await client.parcels.create({
      order_id: orderData.orderId,
      firstname: orderData.fullName,
      familyname: orderData.fullName, // On dédouble si on n'a qu'un champ fullname
      contact_phone: orderData.phoneNumber,
      address: orderData.address,
      to_wilaya_name: orderData.wilaya,
      to_commune_name: orderData.commune,
      product_list: orderData.itemsSummary || "Commande Hikayatki",
      price: orderData.price || 0,
      declared_value: orderData.price || 0,
      do_insurance: false,
      freeshipping: false,
      is_stopdesk: false, // Livraison à domicile par défaut, on pourrait rajouter Stopdesk plus tard
      has_exchange: false,
    });
    
    return parcel;
  } catch (error: any) {
    console.error("Yalidine createParcel", error?.details || error);
    throw new Error(error?.message || "Erreur création colis Yalidine");
  }
}
