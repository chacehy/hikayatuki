"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore, Product } from "@/lib/store";
import { ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ProductGrid({ limit }: { limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_visible", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err instanceof Error ? err.message : JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8c7b65]" />
      </div>
    );
  }

  const displayedProducts = limit ? products.slice(0, limit) : products;

  if (displayedProducts.length === 0) {
    return (
      <div className="text-center py-20 text-stone-500">
        <p>Boutique en cours d'approvisionnement...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayedProducts.map((product) => (
        <div key={product.id} className="group bg-white border border-stone-200 hover:border-[#8c7b65] transition-all duration-300 shadow-sm flex flex-col h-full">
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
            <h3 className="text-lg font-bold text-[#2c302e] mb-2">{product.name}</h3>
            <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">
              {product.description}
            </p>
            <div className="flex justify-between items-center mt-auto">
              <span className="text-[#8c7b65] font-bold text-lg">{product.price.toFixed(2)} DA</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
