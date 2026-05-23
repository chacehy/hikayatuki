"use client";

import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Map to the simple Product model expected by the cart store
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      sub_category_id: product.sub_category_id,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      type="button"
      className="w-full bg-[#2c302e] hover:bg-black text-white py-4 px-6 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-colors border border-[#2c302e] hover:border-black cursor-pointer shadow-md hover:shadow-lg rounded-none"
    >
      <ShoppingBag size={18} />
      Ajouter au Panier
    </button>
  );
}
