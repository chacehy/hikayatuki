"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";
import type { MainCategory, SubCategory, Product } from "@/lib/types";
import { ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";

interface ProductGridProps {
  categories?: MainCategory[];
  limit?: number;
}

export default function ProductGrid({ categories, limit }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const selectedMain = categories?.find((c) => c.id === selectedMainId);
  const subCategories = selectedMain?.sub_categories || [];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*, sub_category:sub_categories(*, main_category:main_categories(*))")
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (selectedSubId) {
        query = query.eq("sub_category_id", selectedSubId);
      } else if (selectedMainId) {
        // Get sub_category_ids for this main category
        const currentMain = categories?.find((c) => c.id === selectedMainId);
        const currentSubs = currentMain?.sub_categories || [];
        const subIds = currentSubs.map((sc) => sc.id);
        if (subIds.length > 0) {
          query = query.in("sub_category_id", subIds);
        } else {
          // No sub-categories, no products
          setProducts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(
        "Error fetching products:",
        err instanceof Error ? err.message : JSON.stringify(err)
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMainId, selectedSubId, categories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectMain = (id: string | null) => {
    setSelectedMainId(id);
    setSelectedSubId(null);
  };

  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <div>
      {/* Category Filter Bar */}
      {categories && categories.length > 0 && (
        <div className="mb-10 space-y-4">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleSelectMain(null)}
              className={`px-5 py-2.5 text-sm font-semibold tracking-wide transition-all border ${
                !selectedMainId
                  ? "bg-[#2c302e] text-white border-[#2c302e]"
                  : "bg-white text-stone-600 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65]"
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectMain(cat.id)}
                className={`px-5 py-2.5 text-sm font-semibold tracking-wide transition-all border capitalize ${
                  selectedMainId === cat.id
                    ? "bg-[#2c302e] text-white border-[#2c302e]"
                    : "bg-white text-stone-600 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sub-category Pills */}
          {selectedMainId && subCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedSubId(null)}
                className={`px-4 py-1.5 text-xs font-medium tracking-wide transition-all border ${
                  !selectedSubId
                    ? "bg-[#8c7b65] text-white border-[#8c7b65]"
                    : "bg-white text-stone-500 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65]"
                }`}
              >
                Tout voir
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`px-4 py-1.5 text-xs font-medium tracking-wide transition-all border capitalize ${
                    selectedSubId === sub.id
                      ? "bg-[#8c7b65] text-white border-[#8c7b65]"
                      : "bg-white text-stone-500 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65]"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#8c7b65]" />
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedProducts.length === 0 && (
        <div className="text-center py-20 text-stone-500">
          <p>
            {selectedMainId
              ? "Aucun produit dans cette catégorie pour le moment."
              : "Boutique en cours d'approvisionnement..."}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && displayedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white border border-stone-200 hover:border-[#8c7b65] transition-all duration-300 shadow-sm flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden border-b border-stone-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ShoppingBag size={48} />
                  </div>
                )}

                {/* Quick Add Button Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <button
                    onClick={() => addItem(product)}
                    className="w-full bg-[#2c302e] hover:bg-black text-white py-3 px-4 font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-none"
                  >
                    <ShoppingBag size={16} />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#2c302e] mb-2">
                  {product.name}
                </h3>
                <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[#8c7b65] font-bold text-lg">
                    {product.price.toFixed(2)} DA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
