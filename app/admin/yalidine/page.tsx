import YalidineSyncButton from "@/components/admin/YalidineSyncButton";
import { getSupabaseServer } from "@/lib/supabase-server";
import { verifyPermission } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function YalidineSettingsPage() {
  const staff = await verifyPermission("can_manage_yalidine");
  if (!staff) {
    redirect("/login");
  }

  const client = await getSupabaseServer();
  
  // Check current data counts
  const [wilayaCount, communeCount, centerCount] = await Promise.all([
    client.from("yalidine_wilayas").select("id", { count: "exact", head: true }),
    client.from("yalidine_communes").select("id", { count: "exact", head: true }),
    client.from("yalidine_centers").select("center_id", { count: "exact", head: true }),
  ]);

  const counts = {
    wilayas: wilayaCount.count || 0,
    communes: communeCount.count || 0,
    centers: centerCount.count || 0,
  };

  const isEmpty = counts.wilayas === 0 && counts.communes === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2c302e]">Livraison Yalidine</h1>
        <p className="text-stone-500 mt-1">Configuration et synchronisation du service de livraison</p>
      </div>

      {/* Current Status */}
      <div className="bg-white border border-stone-200 shadow-sm p-6">
        <h2 className="font-bold text-[#2c302e] mb-4">État actuel des données</h2>
        {isEmpty ? (
          <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            ⚠️ Aucune donnée Yalidine n&apos;est chargée. Veuillez cliquer sur &quot;Synchroniser&quot; ci-dessous pour importer les wilayas, communes et centres.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-50 border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold font-mono text-[#2c302e]">{counts.wilayas}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Wilayas</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold font-mono text-[#2c302e]">{counts.communes}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Communes</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-4 text-center">
              <p className="text-2xl font-bold font-mono text-[#2c302e]">{counts.centers}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Centres</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-4 text-center">
              <p className="text-lg font-bold text-[#8c7b65]">✓</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Tarifs (à la demande)</p>
            </div>
          </div>
        )}
      </div>

      {/* Sync Button */}
      <YalidineSyncButton />

      {/* Info */}
      <div className="bg-stone-50 border border-stone-200 p-6 text-sm text-stone-600 space-y-2">
        <h3 className="font-bold text-[#2c302e] mb-2">Comment ça marche</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Les données (wilayas, communes, centres, tarifs) sont stockées localement dans votre base de données</li>
          <li>Le formulaire de commande (composer &amp; boutique) utilise ces données pour les sélecteurs d&apos;adresse</li>
          <li>À la confirmation d&apos;une commande, vous pouvez créer un colis Yalidine en un clic</li>
          <li>Relancez la synchronisation si les tarifs ou zones de livraison changent</li>
        </ul>
      </div>
    </div>
  );
}
