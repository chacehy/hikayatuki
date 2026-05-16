"use client";

import { useState, useEffect, useRef } from "react";
import { addProduct } from "@/app/actions/product";
import { getMainCategories } from "@/app/actions/category";
import type { MainCategory, SubCategory } from "@/lib/types";
import { Upload, Loader2, ChevronDown, Check } from "lucide-react";

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

export default function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    if (e.target.files && e.target.files[0]) {
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("sub_category_id", selectedSubId);
    const result = await addProduct(formData);

    if (result.success) {
      form.reset();
      setPhotoPreview(null);
      setSelectedMainId("");
      setSelectedSubId("");
    } else {
      setErrorMsg(result.error || "Erreur.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-3 text-sm border border-rose-200">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Nom du produit</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65]"
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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65]"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-stone-700 mb-1">Prix (DA)</label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          required
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Image du produit</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Preview" className="h-full object-contain py-1" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-6 h-6 mb-2 text-stone-400" />
              <p className="text-xs text-stone-500">Cliquez pour ajouter</p>
            </div>
          )}
          <input type="file" name="photo" className="hidden" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" id="isVisible" name="isVisible" value="true" defaultChecked className="accent-[#8c7b65]" />
        <label htmlFor="isVisible" className="text-sm text-stone-700">Visible en boutique</label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#2c302e] hover:bg-black text-white py-3 text-sm font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-2 mt-4"
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Ajouter le produit"}
      </button>
    </form>
  );
}
