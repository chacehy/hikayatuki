import OrderBuilder from "@/components/OrderBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Composer mon bouquet | Hikayatooki",
  description: "Composez votre propre bouquet floral avec Hikayatooki.",
};

export default function ComposerPage() {
  return (
    <main className="min-h-screen bg-[#f9f6f0] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-[#8c7b65] font-semibold tracking-widest uppercase text-sm mb-4">
            FEATURE — COMPOSER
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2c302e] mb-6">
            Composez le bouquet <span className="font-serif italic font-light">qui vous ressemble.</span>
          </h1>
          <div className="w-24 h-[1px] bg-[#8c7b65] mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Quatre étapes, calmes et guidées. Vous choisissez l'occasion, la fleur centrale, ses compagnes, puis la finition. Notre atelier valide. Vous recevez.
          </p>
        </header>

        <OrderBuilder />
      </div>
    </main>
  );
}
