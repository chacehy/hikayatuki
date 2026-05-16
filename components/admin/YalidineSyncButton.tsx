"use client";

import { useState } from "react";
import { seedYalidineData } from "@/app/actions/yalidine";
import { RefreshCw, Check, AlertTriangle, Database, Truck, MapPin, Building2, Package } from "lucide-react";

export default function YalidineSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);

    try {
      const res = await seedYalidineData();
      if (res.success) {
        setResult(res.counts);
      } else {
        setError(res.error || "Erreur inconnue.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center gap-3">
        <Truck size={20} className="text-[#8c7b65]" />
        <div>
          <h2 className="font-bold text-[#2c302e] text-lg">Yalidine — Synchronisation</h2>
          <p className="text-xs text-stone-500">Importer les wilayas, communes, centres et tarifs depuis l&apos;API Yalidine</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-stone-600">
          Cliquez sur le bouton ci-dessous pour récupérer et mettre à jour les données de livraison.
          Cette opération remplace les données existantes par les dernières informations de Yalidine.
        </p>

        <button
          onClick={handleSync}
          disabled={syncing}
          className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-none rounded-none shadow-sm ${
            syncing
              ? "bg-stone-300 text-stone-500 cursor-wait"
              : "bg-[#2c302e] text-white hover:bg-black"
          }`}
        >
          {syncing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Synchronisation en cours...
            </>
          ) : (
            <>
              <Database size={16} />
              Synchroniser les données Yalidine
            </>
          )}
        </button>

        {result && (
          <div className="bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check size={16} className="text-emerald-600" />
              <span className="font-bold text-emerald-800 text-sm">Synchronisation réussie !</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-emerald-100 p-3 text-center">
                <MapPin size={18} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-bold font-mono text-[#2c302e]">{result.wilayas}</p>
                <p className="text-xs text-stone-500">Wilayas</p>
              </div>
              <div className="bg-white border border-emerald-100 p-3 text-center">
                <Building2 size={18} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-bold font-mono text-[#2c302e]">{result.communes}</p>
                <p className="text-xs text-stone-500">Communes</p>
              </div>
              <div className="bg-white border border-emerald-100 p-3 text-center">
                <Package size={18} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-bold font-mono text-[#2c302e]">{result.centers}</p>
                <p className="text-xs text-stone-500">Centres</p>
              </div>
              <div className="bg-white border border-emerald-100 p-3 text-center">
                <Truck size={18} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-2xl font-bold font-mono text-[#2c302e]">{result.fees}</p>
                <p className="text-xs text-stone-500">Tarifs</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800 text-sm mb-1">Erreur de synchronisation</p>
              <p className="text-rose-600 text-xs">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
