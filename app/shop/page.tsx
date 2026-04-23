import ProductGrid from "@/components/ProductGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique | Hikayatooki",
  description: "Découvrez notre collection de bouquets et cadeaux.",
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#f9f6f0] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-[#8c7b65] font-semibold tracking-widest uppercase text-sm mb-4">
            Boutique
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2c302e] mb-6">
            Celles qu'on <span className="font-serif italic font-light">emporte toujours.</span>
          </h1>
          <div className="w-24 h-[1px] bg-[#8c7b65] mx-auto" />
        </header>

        <ProductGrid />
      </div>
    </main>
  );
}
