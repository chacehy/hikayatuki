"use client";

import { useState } from "react";
import { submitOrder } from "@/app/actions/order";
import { Upload, X, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InspirationForm() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaName, setWilayaName] = useState("");
  const [communeName, setCommuneName] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    if (!photo) {
      setErrorMsg("Veuillez ajouter une photo d'inspiration.");
      return;
    }
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

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phoneNumber", phone);
    formData.append("wilaya", wilayaName);
    formData.append("commune", communeName);
    formData.append("address", address);
    formData.append("order_type", "inspiration");
    formData.append(
      "items",
      JSON.stringify([
        {
          category: "Inspiration",
          item: "Création sur mesure à partir d'une photo d'inspiration",
        },
      ])
    );
    formData.append("photo", photo);

    const result = await submitOrder(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrorMsg(result.error || "Une erreur est survenue.");
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white p-8 border border-stone-200 text-center shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-[#8c7b65] text-white p-4">
            <Check size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#2c302e] mb-4">
          Inspiration envoyée avec succès !
        </h2>
        <p className="text-stone-600 mb-8 max-w-md mx-auto leading-relaxed">
          Notre atelier va examiner votre photo et vos informations. Nous vous contacterons très prochainement pour vous proposer un devis sur mesure.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setSuccess(false);
              setPhoto(null);
              setPhotoPreview(null);
              setFullName("");
              setPhone("");
              setWilayaName("");
              setCommuneName("");
              setAddress("");
            }}
            className="bg-[#2c302e] text-white py-3 px-8 hover:bg-black transition-colors font-medium border-none rounded-none text-sm tracking-wider uppercase"
          >
            Nouvelle Inspiration
          </button>
          <Link
            href="/"
            className="border border-[#2c302e] text-[#2c302e] py-3 px-8 hover:bg-[#2c302e] hover:text-white transition-colors font-medium rounded-none text-sm tracking-wider uppercase flex items-center justify-center"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-20">
      {/* Photo Upload Section */}
      <div className="bg-white p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="text-center">
          <h2 className="text-lg text-[#8c7b65] font-semibold uppercase tracking-widest mb-1">
            Étape 1 — Votre Photo
          </h2>
          <p className="text-stone-500 text-sm">
            Importez une image depuis Pinterest, Instagram ou votre galerie.
          </p>
        </div>

        <div className="bg-[#f9f6f0] p-8 border-2 border-dashed border-[#8c7b65]/40 hover:border-[#8c7b65] transition-colors">
          {!photoPreview ? (
            <label className="flex flex-col items-center justify-center w-full min-h-[200px] cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <Upload className="w-10 h-10 mb-4 text-[#8c7b65]" />
                <p className="text-base text-[#2c302e] font-bold mb-1">
                  Cliquez pour sélectionner une image
                </p>
                <p className="text-xs text-stone-500">PNG, JPG, WEBP jusqu&apos;à 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative inline-block border-[8px] border-white shadow-md mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="max-w-[280px] max-h-[300px] w-auto h-auto object-contain"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-4 -right-4 bg-[#2c302e] text-white p-1.5 hover:bg-black transition-colors rounded-none shadow"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-stone-500 font-medium">Image sélectionnée avec succès</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#2c302e] p-8 md:p-12 text-white shadow-xl space-y-8"
      >
        <div className="text-center">
          <h2 className="text-lg text-[#8c7b65] font-semibold uppercase tracking-widest mb-1">
            Étape 2 — Vos Coordonnées
          </h2>
          <p className="text-stone-300 text-sm">
            Pour que notre atelier puisse vous recontacter avec un devis.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-4 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm text-stone-300 mb-2 font-medium"
            >
              Votre Nom Complet
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Lina Yasmine"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm text-stone-300 mb-2 font-medium"
            >
              Votre Numéro de Mobile
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 0555 12 34 56"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="wilaya"
                className="block text-sm text-stone-300 mb-2 font-medium"
              >
                Wilaya
              </label>
              <input
                type="text"
                id="wilaya"
                value={wilayaName}
                onChange={(e) => setWilayaName(e.target.value)}
                placeholder="Ex: Alger"
                className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="commune"
                className="block text-sm text-stone-300 mb-2 font-medium"
              >
                Commune
              </label>
              <input
                type="text"
                id="commune"
                value={communeName}
                onChange={(e) => setCommuneName(e.target.value)}
                placeholder="Ex: Bab Ezzouar"
                className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm text-stone-300 mb-2 font-medium"
            >
              Adresse Complète
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Cité 200 logements, Batiment B"
              className="w-full bg-[#1a1c1b] border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-[#8c7b65] transition-colors rounded-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#8c7b65] hover:bg-[#6e5f4d] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 transition-colors flex justify-center items-center gap-2 rounded-none text-sm tracking-wider uppercase mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer mon inspiration"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
