"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import { submitOrder } from "@/app/actions/order";
import { getWilayas, getCommunes } from "@/app/actions/yalidine";

export default function CartDrawer() {
  const { items, isCartOpen, toggleCart, removeItem, updateQuantity, clearCart } = useCartStore();

  const [isCheckout, setIsCheckout] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayas, setWilayas] = useState<{id: number, name: string}[]>([]);
  const [communes, setCommunes] = useState<{id: number, name: string}[]>([]);
  const [wilayaId, setWilayaId] = useState("");
  const [wilayaName, setWilayaName] = useState("");
  const [communeName, setCommuneName] = useState("");
  const [address, setAddress] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (isCartOpen) {
      getWilayas().then(setWilayas);
    } else {
      // Reset state when closed
      setIsCheckout(false);
      setSuccess(false);
      setErrorMsg("");
    }
  }, [isCartOpen]);

  const handleWilayaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setWilayaId(selectedId);
    
    const selectedWilaya = wilayas.find(w => w.id.toString() === selectedId);
    setWilayaName(selectedWilaya ? selectedWilaya.name : "");
    setCommuneName(""); // reset commune
    
    if (selectedId) {
      const comms = await getCommunes(parseInt(selectedId));
      setCommunes(comms);
    } else {
      setCommunes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !phone || !wilayaName || !communeName || !address) {
      setErrorMsg("Veuillez remplir toutes vos informations de livraison.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phoneNumber", phone);
    formData.append("wilaya", wilayaName);
    formData.append("commune", communeName);
    formData.append("address", address);
    
    // Map store items to the format expected by the backend
    const formattedItems = items.map(item => ({
      category: "Boutique",
      item: `${item.quantity}x ${item.name} (${item.price} DA)`
    }));
    formData.append("items", JSON.stringify(formattedItems));
    
    // We can also pass total price to order if we want, but for now we rely on confirmOrder to set price.
    // formData.append("price", total.toString());

    const result = await submitOrder(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      if (clearCart) clearCart();
    } else {
      setErrorMsg(result.error || "Une erreur est survenue.");
    }
  };

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
            {isCheckout && !success ? (
              <button onClick={() => setIsCheckout(false)} className="mr-2 text-stone-400 hover:text-stone-800">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <ShoppingBag size={24} className="text-[#8c7b65]" />
            )}
            {success ? "Commande Réussie" : isCheckout ? "Livraison" : "Votre Panier"}
          </h2>
          <button onClick={toggleCart} className="text-stone-400 hover:text-stone-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="bg-[#8c7b65] text-white p-4 rounded-full">
                <Check size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2c302e] mb-2">Merci !</h3>
                <p className="text-stone-600">
                  Votre commande a bien été enregistrée. Nous vous contacterons très prochainement.
                </p>
              </div>
              <button 
                onClick={toggleCart}
                className="bg-[#2c302e] text-white py-3 px-8 hover:bg-black transition-colors font-medium rounded-none"
              >
                Fermer
              </button>
            </div>
          ) : isCheckout ? (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 text-sm">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label htmlFor="cartFullName" className="block text-sm font-bold text-stone-700 mb-1">Nom Complet</label>
                <input 
                  type="text" 
                  id="cartFullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cartPhone" className="block text-sm font-bold text-stone-700 mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  id="cartPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65]"
                  required
                />
              </div>

              <div>
                <label htmlFor="cartWilaya" className="block text-sm font-bold text-stone-700 mb-1">Wilaya</label>
                <select 
                  id="cartWilaya"
                  value={wilayaId}
                  onChange={handleWilayaChange}
                  className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65] bg-white"
                  required
                >
                  <option value="">Sélectionnez...</option>
                  {wilayas.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cartCommune" className="block text-sm font-bold text-stone-700 mb-1">Commune</label>
                <select 
                  id="cartCommune"
                  value={communeName}
                  onChange={(e) => setCommuneName(e.target.value)}
                  disabled={!wilayaId || communes.length === 0}
                  className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65] bg-white disabled:bg-stone-100"
                  required
                >
                  <option value="">Sélectionnez...</option>
                  {communes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cartAddress" className="block text-sm font-bold text-stone-700 mb-1">Adresse Complète</label>
                <input 
                  type="text" 
                  id="cartAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65]"
                  required
                />
              </div>
            </form>
          ) : items.length === 0 ? (
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

        {!success && items.length > 0 && (
          <div className="p-6 bg-white border-t border-stone-200">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-[#2c302e]">Total</span>
              <span className="text-xl font-bold text-[#8c7b65]">{total.toFixed(2)} DA</span>
            </div>
            
            {isCheckout ? (
              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-[#2c302e] text-white py-4 font-bold hover:bg-black disabled:bg-stone-400 transition-colors rounded-none uppercase tracking-widest text-sm flex justify-center items-center gap-2"
              >
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Traitement...</> : "Confirmer l'achat"}
              </button>
            ) : (
              <button 
                onClick={() => setIsCheckout(true)}
                className="w-full bg-[#8c7b65] text-white py-4 font-bold hover:bg-[#6e5f4d] transition-colors rounded-none uppercase tracking-widest text-sm"
              >
                Passer à la caisse
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
