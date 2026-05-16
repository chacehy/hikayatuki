"use client";

import { useState, useEffect } from "react";
import {
  createMainCategory,
  updateMainCategory,
  deleteMainCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  toggleComposable,
} from "@/app/actions/category";
import type { MainCategory, SubCategory } from "@/lib/types";
import {
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: MainCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(
    initialCategories[0]?.id || null
  );
  const [newMainName, setNewMainName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubComposable, setNewSubComposable] = useState(false);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editMainName, setEditMainName] = useState("");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubComposable, setEditSubComposable] = useState(false);
  const [editSubImageUrl, setEditSubImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const selectedMain = categories.find((c) => c.id === selectedMainId);

  const handleCreateMain = async () => {
    if (!newMainName.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("name", newMainName.trim());
    const result = await createMainCategory(fd);
    if (result.success) {
      setNewMainName("");
    }
    setLoading(false);
  };

  const handleUpdateMain = async (id: string) => {
    if (!editMainName.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("name", editMainName.trim());
    await updateMainCategory(id, fd);
    setEditingMainId(null);
    setLoading(false);
  };

  const handleDeleteMain = async (id: string) => {
    if (!confirm("Supprimer cette catégorie principale et toutes ses sous-catégories ?")) return;
    setLoading(true);
    await deleteMainCategory(id);
    setLoading(false);
  };

  const handleCreateSub = async () => {
    if (!newSubName.trim() || !selectedMainId) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("name", newSubName.trim());
    fd.set("main_category_id", selectedMainId);
    fd.set("is_composable", newSubComposable ? "true" : "false");
    const result = await createSubCategory(fd);
    if (result.success) {
      setNewSubName("");
      setNewSubComposable(false);
    }
    setLoading(false);
  };

  const handleUpdateSub = async (id: string) => {
    if (!editSubName.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("name", editSubName.trim());
    fd.set("is_composable", editSubComposable ? "true" : "false");
    fd.set("image_url", editSubImageUrl.trim());
    await updateSubCategory(id, fd);
    setEditingSubId(null);
    setLoading(false);
  };

  const handleDeleteSub = async (id: string) => {
    if (!confirm("Supprimer cette sous-catégorie ?")) return;
    setLoading(true);
    await deleteSubCategory(id);
    setLoading(false);
  };

  const handleToggleComposable = async (id: string, current: boolean) => {
    setLoading(true);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("is_composable", (!current).toString());
    await toggleComposable(fd);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Main Categories */}
      <div>
        <div className="bg-white border border-stone-200 shadow-sm">
          <div className="p-4 border-b border-stone-200 bg-stone-50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">
              Catégories Principales
            </h2>
          </div>

          <div className="divide-y divide-stone-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                  selectedMainId === cat.id
                    ? "bg-[#f0ece1] border-l-4 border-[#8c7b65]"
                    : "hover:bg-stone-50 border-l-4 border-transparent"
                }`}
                onClick={() => setSelectedMainId(cat.id)}
              >
                {editingMainId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editMainName}
                      onChange={(e) => setEditMainName(e.target.value)}
                      className="flex-1 border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:border-[#8c7b65]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateMain(cat.id);
                        if (e.key === "Escape") setEditingMainId(null);
                      }}
                    />
                    <button
                      onClick={() => handleUpdateMain(cat.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-800"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingMainId(null)}
                      className="p-1 text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#2c302e] text-sm capitalize">
                        {cat.name}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({(cat.sub_categories || []).length})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMainId(cat.id);
                          setEditMainName(cat.name);
                        }}
                        className="p-1 text-stone-400 hover:text-[#8c7b65]"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMain(cat.id);
                        }}
                        className="p-1 text-stone-400 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight
                        size={14}
                        className={`text-stone-300 transition-transform ${
                          selectedMainId === cat.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new main category */}
          <div className="p-4 border-t border-stone-200 bg-stone-50/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMainName}
                onChange={(e) => setNewMainName(e.target.value)}
                placeholder="Nouvelle catégorie..."
                className="flex-1 border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65]"
                onKeyDown={(e) => e.key === "Enter" && handleCreateMain()}
              />
              <button
                onClick={handleCreateMain}
                disabled={loading || !newMainName.trim()}
                className="bg-[#2c302e] text-white px-3 py-2 text-sm hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Sub-categories for selected main */}
      <div>
        <div className="bg-white border border-stone-200 shadow-sm">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">
              Sous-catégories
              {selectedMain && (
                <span className="normal-case font-normal text-[#8c7b65] ml-2">
                  — {selectedMain.name}
                </span>
              )}
            </h2>
          </div>

          {!selectedMain ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              Sélectionnez une catégorie principale.
            </div>
          ) : (
            <>
              <div className="divide-y divide-stone-100">
                {(selectedMain.sub_categories || []).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-stone-50/50"
                  >
                    {editingSubId === sub.id ? (
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            className="flex-1 border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:border-[#8c7b65]"
                            autoFocus
                            placeholder="Nom"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateSub(sub.id);
                              if (e.key === "Escape") setEditingSubId(null);
                            }}
                          />
                          <input
                            type="text"
                            value={editSubImageUrl}
                            onChange={(e) => setEditSubImageUrl(e.target.value)}
                            className="flex-1 border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:border-[#8c7b65]"
                            placeholder="URL d'image (optionnel)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateSub(sub.id);
                              if (e.key === "Escape") setEditingSubId(null);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs text-stone-500">
                            <input
                              type="checkbox"
                              checked={editSubComposable}
                              onChange={(e) => setEditSubComposable(e.target.checked)}
                              className="accent-[#8c7b65]"
                            />
                            Composable
                          </label>
                          <button
                            onClick={() => handleUpdateSub(sub.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-800 ml-auto"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingSubId(null)}
                            className="p-1 text-stone-400 hover:text-stone-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#2c302e] font-medium capitalize">
                            {sub.name}
                          </span>
                          {sub.is_composable && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                              <Sparkles size={10} />
                              Composable
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleToggleComposable(sub.id, sub.is_composable)
                            }
                            className={`p-1 transition-colors ${
                              sub.is_composable
                                ? "text-amber-500 hover:text-amber-700"
                                : "text-stone-300 hover:text-amber-500"
                            }`}
                            title={sub.is_composable ? "Désactiver composable" : "Activer composable"}
                          >
                            <Sparkles size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubId(sub.id);
                              setEditSubName(sub.name);
                              setEditSubComposable(sub.is_composable);
                              setEditSubImageUrl(sub.image_url || "");
                            }}
                            className="p-1 text-stone-400 hover:text-[#8c7b65]"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSub(sub.id)}
                            className="p-1 text-stone-400 hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(selectedMain.sub_categories || []).length === 0 && (
                  <div className="p-6 text-center text-stone-400 text-sm">
                    Aucune sous-catégorie.
                  </div>
                )}
              </div>

              {/* Add new sub-category */}
              <div className="p-4 border-t border-stone-200 bg-stone-50/50">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Nouvelle sous-catégorie..."
                    className="flex-1 border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65]"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSub()}
                  />
                  <label className="flex items-center gap-1 text-xs text-stone-500 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={newSubComposable}
                      onChange={(e) => setNewSubComposable(e.target.checked)}
                      className="accent-[#8c7b65]"
                    />
                    Composable
                  </label>
                  <button
                    onClick={handleCreateSub}
                    disabled={loading || !newSubName.trim()}
                    className="bg-[#2c302e] text-white px-3 py-2 text-sm hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
