"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSetting } from "@/app/actions/settings";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const [apiId, setApiId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettings();
      if (settings.yalidine_api_id) setApiId(settings.yalidine_api_id);
      if (settings.yalidine_api_token) setApiToken(settings.yalidine_api_token);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    await updateSetting("yalidine_api_id", apiId);
    const result = await updateSetting("yalidine_api_token", apiToken);

    if (result.success) {
      setMessage({ text: "Paramètres sauvegardés avec succès.", type: "success" });
    } else {
      setMessage({ text: "Erreur lors de la sauvegarde.", type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-[#2c302e]">Paramètres de la Boutique</h1>
        <p className="text-stone-500 mt-1">Configuration de la livraison et des intégrations</p>
      </header>

      <div className="bg-white border border-stone-200 p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-[#2c302e] mb-6">Intégration Yalidine</h2>
        
        {message.text && (
          <div className={`p-4 mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">API ID</label>
            <input 
              type="text" 
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              placeholder="Ex: 123456789012345678"
              className="w-full bg-stone-50 border border-stone-200 text-[#2c302e] px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">API Token</label>
            <input 
              type="text" 
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Ex: abcdefghijklmnopqrstuvwxyz12345678"
              className="w-full bg-stone-50 border border-stone-200 text-[#2c302e] px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors"
            />
            <p className="text-xs text-stone-400 mt-2">
              Vous trouverez ces informations dans votre espace développeur sur le tableau de bord Yalidine/Guepex. Laissez vide pour utiliser le Mode Test (Fallback).
            </p>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="bg-[#2c302e] text-white py-3 px-6 hover:bg-black transition-colors font-medium flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer la configuration
          </button>
        </form>
      </div>
    </>
  );
}
