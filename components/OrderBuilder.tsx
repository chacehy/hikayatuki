"use client";

import { useState, useEffect } from "react";
import { submitOrder } from "@/app/actions/order";
import { getRawMaterialsBySubCategory } from "@/app/actions/raw-material";
import type { SubCategory, RawMaterial } from "@/lib/types";
import {
  Upload,
  X,
  Check,
  Loader2,
  Sparkles,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";

interface GroupedCategories {
  [mainId: string]: {
    mainName: string;
    subs: SubCategory[];
  };
}

export default function OrderBuilder({
  groupedCategories,
}: {
  groupedCategories: GroupedCategories;
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

  // ── Step 3: Photo ──
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ── Step 4: Contact info ──
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaName, setWilayaName] = useState("");
  const [communeName, setCommuneName] = useState("");
  const [address, setAddress] = useState("");

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
    if (!wilayaName || !communeName || !address) {
      setErrorMsg("Veuillez remplir toutes vos informations de livraison.");
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
    formData.append("wilaya", wilayaName);
    formData.append("commune", communeName);
    formData.append("address", address);
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
    if (photo) {
      formData.append("photo", photo);
    }

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
            setPhoto(null);
            setPhotoPreview(null);
            setFullName("");
            setPhone("");
            setWilayaName("");
            setCommuneName("");
            setAddress("");
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
        {[1, 2, 3, 4].map((s) => (
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
            {s < 4 && (
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

          {Object.entries(groupedCategories).map(
            ([mainId, { mainName, subs }]) => (
              <div
                key={mainId}
                className="bg-white p-6 border border-stone-100 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#2c302e] mb-4 border-b border-stone-100 pb-2 capitalize">
                  {mainName}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {subs.map((sub: SubCategory) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectFramework(sub)}
                      className="group relative px-5 py-3 text-sm font-medium transition-all border bg-white text-stone-600 border-stone-200 hover:border-[#8c7b65] hover:text-[#8c7b65] hover:shadow-md capitalize"
                    >
                      <Sparkles
                        size={12}
                        className="inline mr-2 text-amber-500"
                      />
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
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
              <p className="text-sm">Vous pouvez continuer avec une photo d&apos;inspiration.</p>
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

      {/* ═══ Step 3: Photo (Optional) ═══ */}
      {step === 3 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">
              Étape 3 — Photo d&apos;Inspiration
            </h2>
            <p className="text-stone-500">
              Optionnel : ajoutez une photo pour guider notre atelier.
            </p>
          </div>

          <div className="bg-[#f9f6f0] p-6 border-l-4 border-[#8c7b65]">
            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#8c7b65] cursor-pointer hover:bg-[#f0ece1] transition-colors rounded-none">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-[#8c7b65]" />
                  <p className="text-sm text-[#8c7b65] font-medium">
                    Cliquez pour ajouter une image
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            ) : (
              <div className="relative inline-block border-[6px] border-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="max-w-[200px] h-auto object-cover"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-3 -right-3 bg-[#2c302e] text-white p-1 hover:bg-black transition-colors rounded-none"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="text-sm text-stone-500 hover:text-[#8c7b65] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} />
              Retour
            </button>
            <button
              onClick={() => setStep(4)}
              className="bg-[#2c302e] text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-black transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* ═══ Step 4: Checkout Form ═══ */}
      {step === 4 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl text-[#8c7b65] font-semibold uppercase tracking-widest mb-2">
              Étape 4 — Vos Informations
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
              {photoPreview && (
                <div className="flex justify-between border-b border-stone-50 pb-2">
                  <span className="text-stone-500">Photo d&apos;inspiration</span>
                  <span className="text-emerald-600 font-medium">✓ Ajoutée</span>
                </div>
              )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="wilaya"
                    className="block text-sm text-stone-300 mb-2"
                  >
                    Wilaya
                  </label>
                  <input
                    type="text"
                    id="wilaya"
                    value={wilayaName}
                    onChange={(e) => setWilayaName(e.target.value)}
                    placeholder="Ex: Alger"
                    className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="commune"
                    className="block text-sm text-stone-300 mb-2"
                  >
                    Commune
                  </label>
                  <input
                    type="text"
                    id="commune"
                    value={communeName}
                    onChange={(e) => setCommuneName(e.target.value)}
                    placeholder="Ex: Bab Ezzouar"
                    className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm text-stone-300 mb-2"
                >
                  Adresse Complète
                </label>
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
                ) : (
                  "Envoyer la Commande"
                )}
              </button>
            </div>
          </form>

          <button
            onClick={() => setStep(3)}
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
