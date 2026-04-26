"use server";

import { supabase } from "@/lib/supabase";

export async function getSettings() {
  const { data, error } = await supabase.from("store_settings").select("*");
  if (error || !data) return {};

  return data.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function updateSetting(key: string, value: string) {
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    console.error("Erreur lors de la sauvegarde du paramètre", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
