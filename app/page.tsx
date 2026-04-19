import OrderBuilder from "@/components/OrderBuilder";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-background-soft)] relative">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-arabic text-[#8c7b65] mb-4">حكايتكي</h1>
          <p className="text-[#2c302e] tracking-widest uppercase text-sm font-semibold max-w-md mx-auto">
            Design Floral & Cadeaux Sur Mesure
          </p>
        </header>

        {/* Builder */}
        <OrderBuilder />

      </div>
    </main>
  );
}
