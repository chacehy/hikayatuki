"use client";

import { useState } from "react";
import { submitOrder } from "@/app/actions/order";
import { getWilayas, getCommunes } from "@/app/actions/yalidine";
import { Upload, X, Check, Loader2 } from "lucide-react";

type ItemCategory = {
  category: string;
  items: string[];
};

const inventory: ItemCategory[] = [
  {
    category: "Mariage et fiançailles",
    items: [
      "bouquet", "couronne", "boutonnière", "eventaille", "bracelet", 
      "توزيعات", "pack fiançailles", "bouquet de valise", "brosh", 
      "pack", "deco véhicule", "act civil", "filles d'honneur"
    ]
  },
  {
    category: "Décoration",
    items: ["Décoration maison", "Décoration boutique", "fêtes et évents"]
  },
  {
    category: "Plantes",
    items: ["arbre", "plantes", "pot", "vase"]
  },
  {
    category: "Fleurs et tiges",
    items: ["fleurs", "tiges", "herb", "baby flowers"]
  },
  {
    category: "Accessoires",
    items: ["parure", "تاج", "sac"]
  },
  {
    category: "Cadeau 🎁",
    items: ["bouquet avec papier", "box de fleurs", "box chocolat", "enfant et baby"]
  },
  {
    category: "Soutenance et cérémonie",
    items: ["petit bouquet", "chapeau décorée", "couronne floral", "bouquet papier", "trends"]
  }
];

export default function OrderBuilder() {
  const [selectedItems, setSelectedItems] = useState<{ category: string, item: string }[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

  const toggleItem = (category: string, item: string) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.category === category && i.item === item);
      if (exists) {
        return prev.filter((i) => !(i.category === category && i.item === item));
      } else {
        return [...prev, { category, item }];
      }
    });
  };

  useEffect(() => {
    getWilayas().then(setWilayas);
  }, []);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName) {
      setErrorMsg("Veuillez entrer votre nom complet.");
      return;
    }

    if (!phone) {
      setErrorMsg("Veuillez entrer votre numéro de mobile.");
      return;
    }

    if (!wilayaName || !communeName || !address) {
      setErrorMsg("Veuillez remplir toutes vos informations de livraison.");
      return;
    }

    if (selectedItems.length === 0 && !photo) {
      setErrorMsg("Veuillez sélectionner au moins un article ou envoyer une photo.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phoneNumber", phone);
    formData.append("wilaya", wilayaName);
    formData.append("commune", communeName);
    formData.append("address", address);
    formData.append("items", JSON.stringify(selectedItems));
    if (photo) {
      formData.append("photo", photo);
    }

    const result = await submitOrder(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setSelectedItems([]);
      setPhoto(null);
      setPhotoPreview(null);
      setFullName("");
      setPhone("");
      setWilayaId("");
      setWilayaName("");
      setCommuneName("");
      setAddress("");
    } else {
      setErrorMsg(result.error || "Une erreur est survenue.");
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-8 border border-stone-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#8c7b65] text-white p-4">
            <Check size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#2c302e] mb-4">Commande Confirmée !</h2>
        <p className="text-stone-600 mb-8">
          Nous avons bien reçu votre demande. Nous vous contacterons très prochainement au <strong>{phone}</strong> pour confirmer les détails.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="bg-[#2c302e] text-white py-3 px-8 hover:bg-[#1a1c1b] transition-colors font-medium border-none rounded-none"
        >
          Nouvelle Commande
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-20 border-none">
      
      {/* Categories */}
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">Notre Collection</h2>
          <p className="text-stone-500">Sélectionnez les articles pour créer votre commande sur mesure.</p>
        </div>

        {inventory.map((cat, idx) => (
          <div key={idx} className="bg-white p-6 border border-stone-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2c302e] mb-4 border-b border-stone-100 pb-2">{cat.category}</h3>
            <div className="flex flex-wrap gap-3">
              {cat.items.map((item, itemIdx) => {
                const isSelected = selectedItems.some(i => i.category === cat.category && i.item === item);
                return (
                  <button
                    key={itemIdx}
                    onClick={() => toggleItem(cat.category, item)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border rounded-none ${
                      isSelected 
                        ? "bg-[#6e5f4d] text-white border-[#6e5f4d]" 
                        : "bg-white text-stone-600 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Or send a photo */}
      <div className="bg-[#f9f6f0] p-6 border-l-4 border-[#8c7b65]">
        <h3 className="text-lg font-bold text-[#2c302e] mb-2 flex items-center gap-2">
          <Upload size={20} className="text-[#8c7b65]" />
          Ou bien envoyer une photo...
        </h3>
        <p className="text-stone-600 text-sm mb-4">
          Vous avez une idée précise en tête ? Importez une photo d'inspiration, nous nous occupons du reste.
        </p>
        
        {!photoPreview ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#8c7b65] cursor-pointer hover:bg-[#f0ece1] transition-colors rounded-none">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-6 h-6 mb-2 text-[#8c7b65]" />
              <p className="text-sm text-[#8c7b65] font-medium">Cliquez pour ajouter une image</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </label>
        ) : (
          <div className="relative inline-block border-[6px] border-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Aperçu" className="max-w-[200px] h-auto object-cover" />
            <button 
              onClick={removePhoto} 
              className="absolute -top-3 -right-3 bg-[#2c302e] text-white p-1 hover:bg-black transition-colors rounded-none"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-white p-6 border border-stone-100 shadow-sm">
          <h3 className="text-sm font-semibold uppercase text-stone-400 tracking-wider mb-4">Votre Sélection</h3>
          <ul className="space-y-2">
            {selectedItems.map((selected, idx) => (
              <li key={idx} className="flex justify-between text-stone-700 pb-2 border-b border-stone-50 last:border-0">
                <span className="font-medium text-[#2c302e]">{selected.item}</span>
                <span className="text-xs text-stone-400">{selected.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="bg-[#2c302e] p-8 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-6 text-center text-[#f9f6f0]">Finaliser la demande</h3>
        
        {errorMsg && (
          <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 mb-6 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label htmlFor="fullName" className="block text-sm text-stone-300 mb-2">Votre Nom Complet</label>
            <input 
              type="text" 
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Lina Yasmine"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-stone-300 mb-2">Votre Numéro de Mobile</label>
            <input 
              type="tel" 
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 0555 12 34 56"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="wilaya" className="block text-sm text-stone-300 mb-2">Wilaya</label>
              <select 
                id="wilaya"
                value={wilayaId}
                onChange={handleWilayaChange}
                className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none appearance-none"
              >
                <option value="">Sélectionnez...</option>
                {wilayas.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="commune" className="block text-sm text-stone-300 mb-2">Commune</label>
              <select 
                id="commune"
                value={communeName}
                onChange={(e) => setCommuneName(e.target.value)}
                disabled={!wilayaId || communes.length === 0}
                className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none appearance-none disabled:opacity-50"
              >
                <option value="">Sélectionnez...</option>
                {communes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm text-stone-300 mb-2">Adresse Complète</label>
            <input 
              type="text" 
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Cité 200 logements, Batiment B"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
            />
          </div>

          <button 
            type="submit"  
            disabled={isSubmitting}
            className="w-full bg-[#8c7b65] hover:bg-[#6e5f4d] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 transition-colors flex justify-center items-center gap-2 rounded-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Envoi en cours...
              </>
            ) : "Envoyer la Commande"}
          </button>
        </div>
      </form>
    </div>
  );
}
