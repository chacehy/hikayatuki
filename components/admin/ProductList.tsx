"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteProduct, toggleProductVisibility, updateProductTag } from "@/app/actions/product";
import { Eye, EyeOff, Trash2, Loader2, Tag, X } from "lucide-react";
import type { ProductWithCategory } from "@/lib/types";

const PRESET_COLORS = [
  { name: "Rouge", bg: "#fee2e2" },
  { name: "Vert", bg: "#d1fae5" },
  { name: "Orange", bg: "#fef3c7" },
  { name: "Bleu", bg: "#eef2ff" },
  { name: "Rose", bg: "#fce7f3" },
  { name: "Sombre", bg: "#2c302e" },
  { name: "Bronze", bg: "#8c7b65" },
];

function getContrastColor(hexColor: string): string {
  if (!hexColor || hexColor.length < 6) return "#ffffff";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#1c1917" : "#ffffff";
}

export default function ProductList({
  initialProducts,
}: {
  initialProducts: ProductWithCategory[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Tag editing states
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [tagLabel, setTagLabel] = useState("");
  const [tagBgColor, setTagBgColor] = useState("#8c7b65");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    await toggleProductVisibility(id, !currentStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setLoadingId(id);
      await deleteProduct(id);
      setLoadingId(null);
    }
  };

  if (!initialProducts || initialProducts.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-stone-500 border border-stone-200">
        Aucun produit dans le catalogue.
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-sm uppercase tracking-wider text-stone-500">
            <th className="px-4 py-4 font-medium">Produit</th>
            <th className="px-4 py-4 font-medium">Catégorie</th>
            <th className="px-4 py-4 font-medium">Prix</th>
            <th className="px-4 py-4 font-medium">Statut</th>
            <th className="px-4 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {initialProducts.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-stone-50/50 transition-colors"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 relative bg-stone-100 border border-stone-200 flex-shrink-0">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#2c302e]">{product.name}</p>
                      {product.tag_label && (
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border select-none"
                          style={{
                            backgroundColor: product.tag_bg_color || "#8c7b65",
                            color: getContrastColor(product.tag_bg_color || "#8c7b65"),
                            borderColor: `${product.tag_bg_color || "#8c7b65"}dd`
                          }}
                        >
                          {product.tag_label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">
                      {product.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                {product.sub_category ? (
                  <div>
                    <p className="text-xs text-stone-400 capitalize">
                      {product.sub_category.main_category?.name || "—"}
                    </p>
                    <p className="text-sm font-medium text-[#2c302e] capitalize">
                      {product.sub_category.name}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 italic">
                    Non classé
                  </span>
                )}
              </td>
              <td className="px-4 py-4 font-mono font-medium text-stone-700">
                {product.price.toFixed(2)} DA
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium ${
                    product.is_visible
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-stone-100 text-stone-800 border border-stone-200"
                  }`}
                >
                  {product.is_visible ? "Visible" : "Masqué"}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setTagLabel(product.tag_label || "");
                      setTagBgColor(product.tag_bg_color || "#8c7b65");
                      setIsModalOpen(true);
                    }}
                    disabled={loadingId === product.id}
                    className="p-2 text-stone-400 hover:text-[#8c7b65] transition-colors"
                    title="Modifier le badge"
                  >
                    <Tag size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleToggle(product.id, !!product.is_visible)
                    }
                    disabled={loadingId === product.id}
                    className="p-2 text-stone-400 hover:text-[#8c7b65] transition-colors"
                    title={product.is_visible ? "Masquer" : "Afficher"}
                  >
                    {loadingId === product.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : product.is_visible ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={loadingId === product.id}
                    className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tag Edit Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-[#2c302e]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50/50">
              <h3 className="font-bold text-lg text-[#2c302e] flex items-center gap-2">
                <Tag size={18} className="text-[#8c7b65]" />
                Modifier le badge produit
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-1">Produit</p>
                <p className="font-bold text-base text-[#2c302e]">{selectedProduct.name}</p>
              </div>

              {/* Real-time Preview */}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">Aperçu du badge</p>
                <div className="flex justify-center items-center py-6 bg-stone-50 border border-stone-200/60">
                  {tagLabel ? (
                    <span
                      className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider border select-none transition-all duration-200"
                      style={{
                        backgroundColor: tagBgColor,
                        borderColor: `${tagBgColor}dd`,
                        color: getContrastColor(tagBgColor),
                      }}
                    >
                      {tagLabel}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Aucun badge (invisible)</span>
                  )}
                </div>
              </div>

              {/* Tag Label Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Texte du badge
                </label>
                <input
                  type="text"
                  value={tagLabel}
                  onChange={(e) => setTagLabel(e.target.value)}
                  placeholder="Ex: STOCK FAIBLE, PROMO, NOUVEAU..."
                  maxLength={20}
                  className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
                />
                <p className="text-[10px] text-stone-400">Laissez vide pour supprimer le badge.</p>
              </div>

              {/* Color Picker Swatches */}
              {tagLabel && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Couleur de fond
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setTagBgColor(color.bg)}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          tagBgColor.toLowerCase() === color.bg.toLowerCase()
                            ? "border-stone-900 scale-110 ring-2 ring-stone-200"
                            : "border-stone-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.bg }}
                        title={color.name}
                      >
                        {tagBgColor.toLowerCase() === color.bg.toLowerCase() && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getContrastColor(color.bg) }}
                          />
                        )}
                      </button>
                    ))}
                    {/* Custom Color Selector */}
                    <div className="relative flex items-center gap-1.5 ml-1 border-l border-stone-200 pl-3">
                      <input
                        type="color"
                        value={tagBgColor}
                        onChange={(e) => setTagBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-stone-300 p-0.5 bg-white"
                        title="Couleur personnalisée"
                      />
                      <span className="text-xs font-mono text-stone-500 uppercase">{tagBgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-stone-100 bg-stone-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-stone-300 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSavingTag}
                onClick={async () => {
                  setIsSavingTag(true);
                  try {
                    const result = await updateProductTag(
                      selectedProduct.id,
                      tagLabel ? tagLabel.trim() : null,
                      tagLabel ? tagBgColor : null
                    );
                    if (result.success) {
                      selectedProduct.tag_label = tagLabel ? tagLabel.trim() : null;
                      selectedProduct.tag_bg_color = tagLabel ? tagBgColor : null;
                      setIsModalOpen(false);
                    } else {
                      alert(result.error || "Erreur de mise à jour");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Une erreur est survenue lors de l'enregistrement.");
                  } finally {
                    setIsSavingTag(false);
                  }
                }}
                className="px-4 py-2 bg-[#2c302e] hover:bg-black text-white text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isSavingTag ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
