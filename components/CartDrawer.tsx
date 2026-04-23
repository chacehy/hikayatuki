"use client";

import { useCartStore } from "@/lib/store";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isCartOpen, toggleCart, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f9f6f0] shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-[#2c302e] flex items-center gap-2">
            <ShoppingBag size={24} className="text-[#8c7b65]" />
            Votre Panier
          </h2>
          <button onClick={toggleCart} className="text-stone-400 hover:text-stone-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 space-y-4">
              <ShoppingBag size={48} className="text-stone-300" />
              <p>Votre panier est vide.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 border border-stone-100 shadow-sm">
                <div className="relative w-20 h-20 flex-shrink-0 bg-stone-100 border border-stone-200">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#2c302e] text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-[#8c7b65] font-semibold mt-1">{item.price.toFixed(2)} DA</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 bg-stone-50">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium text-[#2c302e] min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-[#2c302e]">Total</span>
              <span className="text-xl font-bold text-[#8c7b65]">{total.toFixed(2)} DA</span>
            </div>
            <button className="w-full bg-[#8c7b65] text-white py-4 font-bold hover:bg-[#6e5f4d] transition-colors rounded-none uppercase tracking-widest text-sm">
              Commander
            </button>
          </div>
        )}
      </div>
    </>
  );
}
