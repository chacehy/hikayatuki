"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navbar in admin section
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed w-full bg-[#f9f6f0]/90 backdrop-blur-md z-30 border-b border-[#e8c8b8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-arabic text-[#8c7b65] hover:text-[#6e5f4d] transition-colors">
              حكايتكي
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#2c302e] hover:text-[#8c7b65] font-medium tracking-wide transition-colors">
              Accueil
            </Link>
            <Link href="/shop" className="text-[#2c302e] hover:text-[#8c7b65] font-medium tracking-wide transition-colors">
              Boutique
            </Link>
            <Link href="/composer" className="text-[#2c302e] hover:text-[#8c7b65] font-medium tracking-wide transition-colors">
              Sur Mesure
            </Link>
          </div>

          {/* Cart & Mobile menu */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleCart}
              className="relative p-2 text-[#2c302e] hover:text-[#8c7b65] transition-colors"
            >
              <ShoppingBag size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#8c7b65] rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#2c302e] hover:text-[#8c7b65] p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-[#2c302e] hover:bg-stone-50 hover:text-[#8c7b65]"
            >
              Accueil
            </Link>
            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-[#2c302e] hover:bg-stone-50 hover:text-[#8c7b65]"
            >
              Boutique
            </Link>
            <Link 
              href="/composer" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-[#2c302e] hover:bg-stone-50 hover:text-[#8c7b65]"
            >
              Sur Mesure
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
