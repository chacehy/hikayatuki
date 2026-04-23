"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/store";
import { deleteProduct, toggleProductVisibility } from "@/app/actions/product";
import { Eye, EyeOff, Trash2, Edit, Loader2 } from "lucide-react";

export default function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200 text-sm uppercase tracking-wider text-stone-500">
            <th className="px-6 py-4 font-medium">Produit</th>
            <th className="px-6 py-4 font-medium">Prix</th>
            <th className="px-6 py-4 font-medium">Statut</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {initialProducts.map((product) => (
            <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 relative bg-stone-100 border border-stone-200 flex-shrink-0">
                    {product.image_url && (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#2c302e]">{product.name}</p>
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{product.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono font-medium text-stone-700">
                {product.price.toFixed(2)} DA
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium ${
                  // @ts-ignore
                  product.is_visible 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-stone-100 text-stone-800 border border-stone-200'
                }`}>
                  {/* @ts-ignore */}
                  {product.is_visible ? "Visible" : "Masqué"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleToggle(product.id, (product as any).is_visible)}
                    disabled={loadingId === product.id}
                    className="p-2 text-stone-400 hover:text-[#8c7b65] transition-colors"
                    // @ts-ignore
                    title={product.is_visible ? "Masquer" : "Afficher"}
                  >
                    {loadingId === product.id ? <Loader2 size={16} className="animate-spin" /> : 
                     // @ts-ignore
                     (product.is_visible ? <EyeOff size={16} /> : <Eye size={16} />)}
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
    </div>
  );
}
