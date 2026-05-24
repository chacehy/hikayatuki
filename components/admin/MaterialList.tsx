"use client";

import { useState, useEffect } from "react";
import {
  deleteRawMaterial,
  toggleRawMaterialVisibility,
  getMaterialLinks,
  updateMaterialLinks,
} from "@/app/actions/raw-material";
import { getComposableSubCategories } from "@/app/actions/category";
import type { RawMaterial, SubCategory } from "@/lib/types";
import Image from "next/image";
import {
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Link as LinkIcon,
  X,
  Check,
  Sparkles,
} from "lucide-react";

export default function MaterialList({
  initialMaterials,
}: {
  initialMaterials: RawMaterial[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [composableSubs, setComposableSubs] = useState<SubCategory[]>([]);
  const [linkedSubIds, setLinkedSubIds] = useState<string[]>([]);
  const [savingLinks, setSavingLinks] = useState(false);

  useEffect(() => {
    if (linkingId) {
      loadLinkData(linkingId);
    }
  }, [linkingId]);

  const loadLinkData = async (materialId: string) => {
    const [subs, links] = await Promise.all([
      getComposableSubCategories(),
      getMaterialLinks(materialId),
    ]);
    setComposableSubs(subs as any);
    setLinkedSubIds(links);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    await toggleRawMaterialVisibility(id, !currentStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette matière première ?")) return;
    setLoadingId(id);
    await deleteRawMaterial(id);
    setLoadingId(null);
  };

  const handleSaveLinks = async () => {
    if (!linkingId) return;
    setSavingLinks(true);
    await updateMaterialLinks(linkingId, linkedSubIds);
    setSavingLinks(false);
    setLinkingId(null);
  };

  const toggleLinkedSub = (subId: string) => {
    setLinkedSubIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  if (!initialMaterials || initialMaterials.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-stone-500 border border-stone-200">
        Aucune matière première dans le catalogue.
      </div>
    );
  }

  // Group composable subs by main category for the linker modal
  const groupedSubs = composableSubs.reduce((acc: Record<string, SubCategory[]>, sub: any) => {
    const parentName = sub.main_category?.name || "Autre";
    if (!acc[parentName]) acc[parentName] = [];
    acc[parentName].push(sub);
    return acc;
  }, {});

  return (
    <>
      <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-sm uppercase tracking-wider text-stone-500">
              <th className="px-6 py-4 font-medium">Matière</th>
              <th className="px-6 py-4 font-medium">Prix</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {initialMaterials.map((material: any) => {
              const linkCount = (material.sub_category_materials || []).length;
              return (
                <tr
                  key={material.id}
                  className="hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 relative bg-stone-100 border border-stone-200 flex-shrink-0">
                        {material.image_url && (
                          <Image
                            src={material.image_url}
                            alt={material.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#2c302e] text-sm">
                          {material.name}
                        </p>
                        {material.description && (
                          <p className="text-xs text-stone-500 truncate max-w-[180px]">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-stone-700">
                    {material.price.toFixed(2)} DA
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
                          material.is_visible
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-800 border border-stone-200"
                        }`}
                      >
                        {material.is_visible ? "Visible" : "Masqué"}
                      </span>
                      {linkCount === 0 ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-bold">
                          ⚠️ Non lié (0 catégorie)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                          ✓ Lié ({linkCount} catégorie{linkCount > 1 ? "s" : ""})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setLinkingId(material.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors border shadow-sm ${
                          linkCount === 0
                            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                        }`}
                        title="Gérer les sous-catégories associées"
                      >
                        <LinkIcon size={14} />
                        Lier aux catégories
                      </button>
                      <button
                        onClick={() =>
                          handleToggle(material.id, material.is_visible)
                        }
                        disabled={loadingId === material.id}
                        className="p-2 text-stone-400 hover:text-[#8c7b65] transition-colors"
                        title={material.is_visible ? "Masquer" : "Afficher"}
                      >
                        {loadingId === material.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : material.is_visible ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        disabled={loadingId === material.id}
                        className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Linking Modal */}
      {linkingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[#2c302e]">
                  Lier aux sous-catégories
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Sélectionnez les sous-catégories composables où cette matière sera disponible.
                </p>
              </div>
              <button
                onClick={() => setLinkingId(null)}
                className="p-2 text-stone-400 hover:text-stone-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {Object.entries(groupedSubs).map(([parentName, subs]) => (
                <div key={parentName}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 capitalize">
                    {parentName}
                  </h4>
                  <div className="space-y-1">
                    {subs.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center gap-3 p-2 hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={linkedSubIds.includes(sub.id)}
                          onChange={() => toggleLinkedSub(sub.id)}
                          className="accent-[#8c7b65]"
                        />
                        <span className="text-sm text-[#2c302e] capitalize flex items-center gap-2">
                          {sub.name}
                          <Sparkles size={12} className="text-amber-500" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedSubs).length === 0 && (
                <div className="text-center text-stone-400 text-sm py-4">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Chargement...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={() => setLinkingId(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveLinks}
                disabled={savingLinks}
                className="bg-[#2c302e] text-white px-5 py-2 text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
              >
                {savingLinks ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
