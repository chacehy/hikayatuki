import InspirationForm from "@/components/InspirationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envoyer une inspiration | Hikayatooki",
  description: "Envoyez une photo d'inspiration pour une création florale sur mesure avec Hikayatooki.",
};

export const dynamic = "force-dynamic";

export default function InspirationPage() {
  return (
    <main className="min-h-screen bg-[#f9f6f0] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-[#8c7b65] font-semibold tracking-widest uppercase text-sm mb-4">
            FEATURE — INSPIRATION
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2c302e] mb-6">
            Un modèle vu{" "}
            <span className="font-serif italic font-light">
              quelque part ?
            </span>
          </h1>
          <div className="w-24 h-[1px] bg-[#8c7b65] mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Envoyez-nous une photo (Pinterest, Instagram, mariage d&apos;une amie) et vos coordonnées. Notre atelier vous contactera sous 24h avec un devis sur mesure.
          </p>
        </header>

        <InspirationForm />
      </div>
    </main>
  );
}
