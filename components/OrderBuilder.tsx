"use client";

import { useState, useEffect } from "react";
import { submitOrder } from "@/app/actions/order";
import { getRawMaterialsBySubCategory } from "@/app/actions/raw-material";
import type { SubCategory, RawMaterial } from "@/lib/types";
import {
  Check,
  Loader2,
  Sparkles,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import DeliveryAddressSelector from "@/components/DeliveryAddressSelector";

export default function OrderBuilder({
  subCategories,
}: {
  subCategories: SubCategory[];
}) {
  // ── Step management ──
  const [step, setStep] = useState(1);

  // ── Step 1: Framework selection ──
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedSubName, setSelectedSubName] = useState("");

  // ── Step 2: Raw materials ──
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<
    Record<string, number>
  >({});

  // ── Step 3: Contact info ──
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryData, setDeliveryData] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Load materials when framework selected ──
  useEffect(() => {
    if (selectedSubId) {
      setLoadingMaterials(true);
      getRawMaterialsBySubCategory(selectedSubId)
        .then((data) => setMaterials(data as RawMaterial[]))
        .finally(() => setLoadingMaterials(false));
    }
  }, [selectedSubId]);

  const handleSelectFramework = (sub: SubCategory) => {
    setSelectedSubId(sub.id);
    setSelectedSubName(sub.name);
    setSelectedMaterials({});
    setStep(2);
  };

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterials((prev) => {
      if (prev[materialId]) {
        const next = { ...prev };
        delete next[materialId];
        return next;
      }
      return { ...prev, [materialId]: 1 };
    });
  };

  const updateMaterialQty = (materialId: string, delta: number) => {
    setSelectedMaterials((prev) => {
      const current = prev[materialId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const updated = { ...prev };
        delete updated[materialId];
        return updated;
      }
      return { ...prev, [materialId]: next };
    });
  };

  const selectedMaterialCount = Object.keys(selectedMaterials).length;

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
    if (!deliveryData?.wilayaName || !deliveryData?.communeName) {
      setErrorMsg("Veuillez sélectionner votre wilaya et commune.");
      return;
    }
    if (deliveryData.deliveryType === "home" && !deliveryData.address) {
      setErrorMsg("Veuillez entrer votre adresse de livraison.");
      return;
    }

    setIsSubmitting(true);

    // Build the materials selection data
    const materialItems = Object.entries(selectedMaterials).map(
      ([matId, qty]) => {
        const mat = materials.find((m) => m.id === matId);
        return {
          id: matId,
          name: mat?.name || "",
          quantity: qty,
          price: mat?.price || 0,
        };
      }
    );

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phoneNumber", phone);
    formData.append("wilaya", deliveryData.wilayaName);
    formData.append("commune", deliveryData.communeName);
    formData.append("address", deliveryData.address || "");
    formData.append("wilaya_id", String(deliveryData.wilayaId));
    formData.append("commune_id", String(deliveryData.communeId));
    formData.append("delivery_type", deliveryData.deliveryType);
    formData.append("delivery_fee", String(deliveryData.deliveryFee || 0));
    if (deliveryData.stopDeskId) {
      formData.append("stop_desk_id", String(deliveryData.stopDeskId));
    }
    formData.append("order_type", "composer");
    formData.append("composer_sub_category_id", selectedSubId || "");
    formData.append(
      "items",
      JSON.stringify([
        {
          category: selectedSubName,
          item: `Composition: ${selectedSubName}`,
        },
      ])
    );
    formData.append("selected_materials", JSON.stringify(materialItems));

    const result = await submitOrder(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrorMsg(result.error || "Une erreur est survenue.");
    }
  };

  // ── Success Screen ──
  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-8 border border-stone-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#8c7b65] text-white p-4">
            <Check size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#2c302e] mb-4">
          Commande Confirmée !
        </h2>
        <p className="text-stone-600 mb-8">
          Nous avons bien reçu votre demande de composition. Nous vous
          contacterons très prochainement pour confirmer les détails.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setSelectedSubId(null);
            setSelectedMaterials({});
            setFullName("");
            setPhone("");
            setDeliveryData(null);
          }}
          className="bg-[#2c302e] text-white py-3 px-8 hover:bg-[#1a1c1b] transition-colors font-medium border-none rounded-none"
        >
          Nouvelle Composition
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-20">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <button
              onClick={() => {
                if (s <= step) setStep(s);
              }}
              className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? "bg-[#8c7b65] text-white"
                  : s < step
                  ? "bg-[#2c302e] text-white"
                  : "bg-stone-200 text-stone-400"
              }`}
            >
              {s < step ? <Check size={16} /> : s}
            </button>
            {s < 3 && (
              <div
                className={`w-12 h-[2px] ${
                  s < step ? "bg-[#2c302e]" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ═══ Step 1: Choose Framework ═══ */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">
              Étape 1 — Choisir le Type
            </h2>
            <p className="text-stone-500">
              Quel type de création souhaitez-vous composer ?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subCategories.map((sub: SubCategory) => (
              <div
                key={sub.id}
                onClick={() => handleSelectFramework(sub)}
                className="group relative h-48 sm:h-64 cursor-pointer overflow-hidden bg-stone-200 border border-stone-200"
              >
                {sub.image_url ? (
                  <Image
                    src={sub.image_url}
                    alt={sub.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 group-hover:bg-stone-200 transition-colors">
                    <Sparkles size={48} className="opacity-20 mb-2" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white text-xl sm:text-2xl font-bold text-center tracking-wider capitalize">
                    {sub.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Step 2: Select Raw Materials ═══ */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#8c7b65] mb-4 transition-colors"
            >
              <ArrowLeft size={14} />
              Changer le type
            </button>
            <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">
              Étape 2 — Matières Premières
            </h2>
            <p className="text-stone-500">
              Composition:{" "}
              <span className="font-bold text-[#2c302e] capitalize">
                {selectedSubName}
              </span>
            </p>
          </div>

          {loadingMaterials ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#8c7b65]" />
            </div>
          ) : materials.length === 0 ? (
            <div className="bg-white p-8 border border-stone-200 text-center text-stone-500">
              <p className="mb-4">Aucune matière première disponible pour cette catégorie.</p>
              <p className="text-sm">Vous pouvez continuer vers l&apos;étape de finalisation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {materials.map((material) => {
                const qty = selectedMaterials[material.id] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={material.id}
                    className={`bg-white border transition-all cursor-pointer group ${
                      isSelected
                        ? "border-[#8c7b65] shadow-md"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div
                      onClick={() => toggleMaterial(material.id)}
                      className="relative aspect-square bg-stone-100 overflow-hidden"
                    >
                      {material.image_url ? (
                        <Image
                          src={material.image_url}
                          alt={material.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Sparkles size={32} />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#8c7b65] text-white p-1">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-[#2c302e] text-sm">
                        {material.name}
                      </p>
                      {material.price > 0 && (
                        <p className="text-xs text-[#8c7b65] font-mono mt-0.5">
                          {material.price.toFixed(2)} DA
                        </p>
                      )}
                      {isSelected && (
                        <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-stone-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaterialQty(material.id, -1);
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-bold text-[#2c302e] min-w-[1.5rem] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMaterialQty(material.id, 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-stone-500">
              {selectedMaterialCount} matière(s) sélectionnée(s)
            </p>
            <button
              onClick={() => setStep(3)}
              className="bg-[#2c302e] text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-black transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* ═══ Step 3: Checkout Form ═══ */}
      {step === 3 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">
              Étape 3 — Vos Informations
            </h2>
            <p className="text-stone-500">Finalisez votre demande.</p>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 border border-stone-100 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-stone-400 tracking-wider mb-4">
              Récapitulatif
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-stone-50 pb-2">
                <span className="text-stone-500">Type</span>
                <span className="font-bold text-[#2c302e] capitalize">
                  {selectedSubName}
                </span>
              </div>
              {Object.entries(selectedMaterials).map(([matId, qty]) => {
                const mat = materials.find((m) => m.id === matId);
                return (
                  <div
                    key={matId}
                    className="flex justify-between border-b border-stone-50 pb-2"
                  >
                    <span className="text-stone-600">
                      {mat?.name} × {qty}
                    </span>
                    {mat && mat.price > 0 && (
                      <span className="text-[#8c7b65] font-mono">
                        {(mat.price * qty).toFixed(2)} DA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#2c302e] p-8 text-white shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6 text-center text-[#f9f6f0]">
              Finaliser la demande
            </h3>

            {errorMsg && (
              <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 mb-6 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm text-stone-300 mb-2"
                >
                  Votre Nom Complet
                </label>
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
                <label
                  htmlFor="phone"
                  className="block text-sm text-stone-300 mb-2"
                >
                  Votre Numéro de Mobile
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0555 12 34 56"
                  className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
                />
              </div>
              <DeliveryAddressSelector
                onDeliveryChange={setDeliveryData}
                darkMode={true}
              />

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
                ) : (
                  "Envoyer la Commande"
                )}
              </button>
            </div>
          </form>

          <button
            onClick={() => setStep(2)}
            className="text-sm text-stone-500 hover:text-[#8c7b65] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} />
            Retour
          </button>
        </div>
      )}
    </div>
  );
}
