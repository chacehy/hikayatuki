"use client";

import { useState, useEffect, useRef } from "react";
import { addProduct } from "@/app/actions/product";
import { getMainCategories } from "@/app/actions/category";
import type { MainCategory, SubCategory } from "@/lib/types";
import { Upload, Loader2, ChevronDown, Check, Image as ImageIcon, X } from "lucide-react";

function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "— Sélectionner —",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string; badge?: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.id === value);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-stone-300 px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] transition-all shadow-sm group"
      >
        <span className={`truncate capitalize ${!selectedOption ? "text-stone-400" : "text-[#2c302e] font-medium"}`}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.label}
              {selectedOption.badge && (
                <span className="bg-[#8c7b65]/10 text-[#8c7b65] px-1.5 py-0.5 text-xs font-bold rounded">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-stone-400 group-hover:text-stone-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 shadow-lg max-h-60 overflow-auto divide-y divide-stone-100 animate-in fade-in-80 zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
              value === "" ? "bg-[#8c7b65]/10 text-[#8c7b65] font-medium" : "text-stone-500 hover:bg-stone-50"
            }`}
          >
            <span>{placeholder}</span>
            {value === "" && <Check size={16} className="text-[#8c7b65]" />}
          </button>
          {options.map((opt) => {
            const isSelected = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-sm text-left capitalize transition-colors flex items-center justify-between ${
                  isSelected ? "bg-[#8c7b65]/10 text-[#8c7b65] font-semibold" : "text-[#2c302e] hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.label}
                  {opt.badge && (
                    <span className="bg-[#8c7b65]/10 text-[#8c7b65] px-1.5 py-0.5 text-xs font-bold rounded">
                      {opt.badge}
                    </span>
                  )}
                </span>
                {isSelected && <Check size={16} className="text-[#8c7b65]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [selectedMainId, setSelectedMainId] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubId, setSelectedSubId] = useState("");

  useEffect(() => {
    getMainCategories().then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    if (selectedMainId) {
      const main = categories.find((c) => c.id === selectedMainId);
      setSubCategories(main?.sub_categories || []);
      setSelectedSubId("");
    } else {
      setSubCategories([]);
      setSelectedSubId("");
    }
  }, [selectedMainId, categories]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    } else {
      setPhotoPreviews([]);
    }
  };

  const handleClearPhotos = () => {
    setPhotoPreviews([]);
    // Reset file input value
    const fileInput = document.getElementById("photos") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("sub_category_id", selectedSubId);

    try {
      const result = await addProduct(formData);

      if (result.success) {
        form.reset();
        setPhotoPreviews([]);
        setSelectedMainId("");
        setSelectedSubId("");
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(result.error || "Erreur de création du produit.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-3 text-sm border border-rose-200 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
          Nom du produit
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Category Selection */}
      <CustomSelect
        label="Catégorie principale"
        value={selectedMainId}
        onChange={setSelectedMainId}
        options={categories.map((cat) => ({ id: cat.id, label: cat.name }))}
      />

      {subCategories.length > 0 && (
        <CustomSelect
          label="Sous-catégorie"
          value={selectedSubId}
          onChange={setSelectedSubId}
          options={subCategories.map((sub) => ({
            id: sub.id,
            label: sub.name,
            badge: sub.is_composable ? "✦ Composable" : undefined,
          }))}
        />
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
          Description (courte)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          required
          placeholder="Résumé affiché sur la liste des produits..."
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Detailed Description */}
      <div>
        <label htmlFor="detailed_description" className="block text-sm font-medium text-stone-700 mb-1">
          Description Détaillée
        </label>
        <textarea
          id="detailed_description"
          name="detailed_description"
          rows={4}
          placeholder="Détails complets affichés sur la page produit..."
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Flower Type */}
      <div>
        <label htmlFor="flower_type" className="block text-sm font-medium text-stone-700 mb-1">
          Type de Fleurs
        </label>
        <input
          type="text"
          id="flower_type"
          name="flower_type"
          placeholder="Ex: Roses Rouges, Pivoines, Eucalyptus"
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Sizes / Dimensions */}
      <div>
        <label htmlFor="sizes" className="block text-sm font-medium text-stone-700 mb-1">
          Dimensions / Options de Taille
        </label>
        <textarea
          id="sizes"
          name="sizes"
          rows={2}
          placeholder="Ex: Taille unique (40cm x 30cm) ou Petit / Moyen / Grand..."
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Care Instructions */}
      <div>
        <label htmlFor="care_instructions" className="block text-sm font-medium text-stone-700 mb-1">
          Conseils d&apos;Entretien
        </label>
        <textarea
          id="care_instructions"
          name="care_instructions"
          rows={3}
          placeholder="Comment prendre soin de ces fleurs..."
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-1">
          Prix (DA)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          required
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
        />
      </div>

      {/* Product Images (Multi-upload) */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-stone-700">Images du produit (Sélection multiple)</label>
          {photoPreviews.length > 0 && (
            <button
              type="button"
              onClick={handleClearPhotos}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              <X size={12} />
              Effacer tout
            </button>
          )}
        </div>
        
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-3 pb-3">
            <Upload className="w-5 h-5 mb-1 text-stone-400" />
            <p className="text-xs text-stone-500">Ajouter une ou plusieurs images</p>
          </div>
          <input
            type="file"
            id="photos"
            name="photos"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </label>

        {/* Thumbnail Preview Area */}
        {photoPreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2 border border-stone-100 p-2 bg-stone-50/50">
            {photoPreviews.map((url, idx) => (
              <div key={idx} className="relative aspect-square border border-stone-200 bg-white group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-[#2c302e]/80 text-white text-[9px] text-center font-semibold py-0.5 uppercase tracking-wider">
                    Principale
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop Visibility */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isVisible"
          name="isVisible"
          value="true"
          defaultChecked
          className="accent-[#8c7b65]"
        />
        <label htmlFor="isVisible" className="text-sm text-stone-700">
          Visible en boutique
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#2c302e] hover:bg-black text-white py-3 text-sm font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-2 mt-4 cursor-pointer"
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Ajouter le produit"}
      </button>
    </form>
  );
}
