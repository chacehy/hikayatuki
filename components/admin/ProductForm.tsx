"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions/product";
import { Upload, Loader2 } from "lucide-react";

export default function ProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
    const result = await addProduct(formData);

    if (result.success) {
      form.reset();
      setPhotoPreview(null);
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
