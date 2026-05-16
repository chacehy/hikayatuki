/**
 * Yalidine API Client — Proxied through Supabase Edge Function
 * 
 * The Yalidine API (api.yalidine.app) may not be reachable from all networks.
 * We route all requests through a Supabase Edge Function that acts as a relay.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const PROXY_URL = `${SUPABASE_URL}/functions/v1/yalidine-proxy`;

function getYalidineCredentials() {
  const apiId = process.env.YALIDINE_API_ID;
  const apiToken = process.env.YALIDINE_API_TOKEN;

  if (!apiId || !apiToken) {
    throw new Error("YALIDINE_API_ID and YALIDINE_API_TOKEN must be set in .env");
  }

  return { apiId, apiToken };
}

async function proxyFetch(endpoint: string): Promise<any[]> {
  const { apiId, apiToken } = getYalidineCredentials();

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      endpoint,
      api_id: apiId,
      api_token: apiToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Yalidine proxy error (${res.status}):`, text);
    throw new Error(`Yalidine proxy returned ${res.status}: ${text}`);
  }

  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }

  return json.data || [];
}

// ── Types ──

export interface YalidineWilaya {
  id: number;
  name: string;
  ar_name?: string;
  code?: string;
  has_stop_desk?: boolean;
  is_deliverable?: boolean;
}

export interface YalidineCommune {
  id: number;
  name: string;
  ar_name?: string;
  wilaya_id: number;
  has_stop_desk?: boolean;
  is_deliverable?: boolean;
}

export interface YalidineCenter {
  center_id: number;
  name: string;
  commune_id?: number;
  wilaya_id?: number;
  address?: string;
  gps?: string;
  phone?: string;
  is_center?: boolean;
  has_stop_desk?: boolean;
}

export interface YalidineFee {
  wilaya_id: number;
  wilaya_name?: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable?: boolean;
  has_stop_desk?: boolean;
}

export interface YalidineParcelCreate {
  order_id: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  to_commune_name: string;
  to_wilaya_name: string;
  product_list: string;
  price: number;
  do_insurance: boolean;
  declared_value: number;
  freeshipping: number; // 0 = COD, 1 = free shipping
  is_stopdesk: number; // 0 = home delivery, 1 = stop desk
  stop_desk_id?: number;
  has_exchange: number; // 0 = no exchange
  note?: string;
}

export interface YalidineParcelResponse {
  tracking: string;
  order_id: string;
  label: string;
  [key: string]: any;
}

// ── API Methods ──

export async function fetchWilayas(): Promise<YalidineWilaya[]> {
  return proxyFetch("/wilayas/");
}

export async function fetchCommunes(): Promise<YalidineCommune[]> {
  return proxyFetch("/communes/");
}

export async function fetchCenters(): Promise<YalidineCenter[]> {
  return proxyFetch("/centers/");
}

export async function fetchDeliveryFees(): Promise<YalidineFee[]> {
  // Note: The /fees endpoint requires from_wilaya_id + to_wilaya_id.
  // This is a no-op stub; actual fees are fetched on-demand via fetchFeesForRoute.
  return [];
}

export interface RouteFee {
  from_wilaya_name: string;
  to_wilaya_name: string;
  per_commune: Record<string, {
    commune_id: number;
    commune_name: string;
    express_home: number | null;
    express_desk: number | null;
    economic_home: number | null;
    economic_desk: number | null;
  }>;
}

export async function fetchFeesForRoute(fromWilayaId: number, toWilayaId: number): Promise<RouteFee | null> {
  const { apiId, apiToken } = getYalidineCredentials();

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      endpoint: `/fees/?from_wilaya_id=${fromWilayaId}&to_wilaya_id=${toWilayaId}`,
      api_id: apiId,
      api_token: apiToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Yalidine fees error (${res.status}):`, text);
    return null;
  }

  const json = await res.json();
  // The API returns the fee data directly or in json.data
  const data = json.data || json;
  
  // data might be an array with one item, or an object
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return data;
}

export async function createParcel(parcel: YalidineParcelCreate): Promise<YalidineParcelResponse> {
  const { apiId, apiToken } = getYalidineCredentials();

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      endpoint: "/parcels/",
      api_id: apiId,
      api_token: apiToken,
      parcel_data: [parcel], // API expects an array
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Yalidine create parcel error:", text);
    throw new Error(`Failed to create parcel: ${res.status}`);
  }

  const json = await res.json();
  const created = Array.isArray(json) ? json[0] : json.data?.[0] || json;
  return created;
}

export async function getParcelByTracking(tracking: string): Promise<any> {
  return proxyFetch(`/parcels/${tracking}`);
}
