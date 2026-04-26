import Link from "next/link";
import { Package, ShoppingCart, LayoutDashboard, Settings } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9f6f0] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#2c302e] text-white flex flex-col">
        <div className="p-6 border-b border-stone-700">
          <Link href="/admin" className="text-2xl font-arabic text-[#8c7b65]">
            حكايتكي
          </Link>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none">
            <LayoutDashboard size={18} />
            Vue d'ensemble
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none">
            <Package size={18} />
            Produits
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none">
            <Settings size={18} />
            Paramètres
          </Link>
          {/* Orders are handled on the main admin page currently, but we can add a specific link if needed */}
        </nav>
        <div className="p-4 border-t border-stone-700">
          <Link href="/" className="text-sm text-stone-400 hover:text-white transition-colors">
            &larr; Retour au site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
