import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import Image from "next/image";

import whiteFlower from "@/assets/hikayatookiPics/WhiteflowerBundled.jpg";
import pinkRoses from "@/assets/hikayatookiPics/pinkRosesBouquet.jpg";
import flowerCrown from "@/assets/hikayatookiPics/flowerCrown.jpg";
import callaLily from "@/assets/hikayatookiPics/CallaLilyVase.jpg";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f9f6f0] text-[#2c302e]">
      <HeroSection />

      {/* Values Section */}
      <section className="py-24 bg-[#f9f6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-4">01: Des fleurs qui ne fanent jamais</h3>
              <p className="text-stone-600">Soieries imprimées main, tiges naturelles séchées, finition cousue. Garanti dix ans.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">02: Fabriqué avec soin, livré avec émotion</h3>
              <p className="text-stone-600">Atelier d'Alger. Compositions assemblées une à une, livrées emballées comme un cadeau.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">03: Chaque bouquet raconte une histoire</h3>
              <p className="text-stone-600">On commence par votre حكاية. Ensuite seulement, on choisit les fleurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Univers */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Sept mondes, <span className="font-serif italic font-light">une seule histoire</span> à raconter.
              </h2>
            </div>
            <Link href="#collection" className="hidden md:block hover:text-[#8c7b65] uppercase tracking-widest text-sm font-bold border-b border-black hover:border-[#8c7b65] pb-1 transition-colors">
              Tout voir &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Cards (mockup for visual structure) */}
            <div className="group relative h-[400px] overflow-hidden bg-stone-100 col-span-1 md:col-span-2 lg:col-span-2">
              <Image src={flowerCrown} alt="Mariage & Fiançailles" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                <h3 className="text-3xl font-bold mb-2">Mariage & Fiançailles</h3>
                <p className="mb-4 text-stone-100 max-w-md">L'art floral du grand jour, du bouquet de la mariée aux toutes petites attentions.</p>
                <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-widest">
                  <span className="bg-white/20 px-3 py-1 backdrop-blur-sm">Bouquet</span>
                  <span className="bg-white/20 px-3 py-1 backdrop-blur-sm">Couronne</span>
                  <span className="bg-white/20 px-3 py-1 backdrop-blur-sm">توزيعات</span>
                </div>
              </div>
            </div>

            <div className="group relative h-[400px] overflow-hidden bg-stone-100">
              <Image src={callaLily} alt="Décoration" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                <h3 className="text-3xl font-bold mb-2">Décoration</h3>
                <p className="mb-4 text-stone-100">Pour la maison, la boutique, et chaque événement à raconter.</p>
                <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-widest">
                  <span className="bg-white/20 px-3 py-1 backdrop-blur-sm">Déco home</span>
                  <span className="bg-white/20 px-3 py-1 backdrop-blur-sm">Vase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Histoires */}
      <section className="py-24 bg-[#f9f6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] w-full">
              <Image src={whiteFlower} alt="Amina & Karim" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-12">
                Avant les fleurs, il y a <span className="font-serif italic font-light">les gens.</span>
              </h2>
              
              <div className="mb-8">
                <p className="text-[#8c7b65] uppercase tracking-widest text-sm font-bold mb-4">Chapitre 01 — Le mariage de Amina & Karim</p>
                <blockquote className="text-2xl md:text-3xl font-serif italic font-light leading-relaxed mb-6 text-stone-700">
                  « On voulait des fleurs qui resteraient. Hikayatooki a compris avant qu'on n'explique. »
                </blockquote>
                <p className="font-bold">— Amina, Alger</p>
              </div>

              <div className="flex gap-4 text-sm font-medium border-t border-stone-200 pt-6">
                <button className="text-[#8c7b65] border-b border-[#8c7b65] pb-1">Amina & Karim</button>
                <button className="text-stone-400 hover:text-stone-800 pb-1">de Yasmine</button>
                <button className="text-stone-400 hover:text-stone-800 pb-1">Madame H.</button>
                <button className="text-stone-400 hover:text-stone-800 pb-1">de Lina</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Composer */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h4 className="text-[#8c7b65] uppercase tracking-widest text-sm font-bold mb-4">FEATURE — COMPOSER</h4>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Composez le bouquet <span className="font-serif italic font-light">qui vous ressemble.</span>
              </h2>
              <p className="text-stone-600 text-lg mb-10 leading-relaxed max-w-lg">
                Quatre étapes, calmes et guidées. Vous choisissez l'occasion, la fleur centrale, ses compagnes, puis la finition. Notre atelier valide. Vous recevez.
              </p>
              <Link 
                href="/composer" 
                className="inline-block bg-[#2c302e] text-white px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-[#8c7b65] transition-all duration-300 rounded-none shadow-lg"
              >
                COMMENCER MA COMPOSITION
              </Link>
            </div>
            <div className="relative h-[600px] w-full order-1 lg:order-2 bg-stone-100 p-8 flex items-center justify-center">
              {/* Illustration or Image for Composer */}
              <div className="relative w-full h-full">
                <Image src={pinkRoses} alt="Composer" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Inspiration */}
      <section className="py-24 bg-[#f9f6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] w-full bg-stone-200 border border-stone-300">
               {/* Just a decorative block if we don't have enough images, or could use callaLily */}
               <Image src={callaLily} alt="Inspiration" fill className="object-cover opacity-80" />
            </div>
            <div>
              <h4 className="text-[#8c7b65] uppercase tracking-widest text-sm font-bold mb-4">FEATURE — INSPIRATION</h4>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Un modèle vu <span className="font-serif italic font-light">quelque part</span> ? On le recrée pour vous.
              </h2>
              <p className="text-stone-600 text-lg mb-10 leading-relaxed max-w-lg">
                Envoyez-nous une photo — Pinterest, Instagram, mariage d'une amie. Notre atelier vous renvoie un devis sous 24h.
              </p>
              <Link 
                href="/composer" 
                className="inline-block bg-transparent border border-[#2c302e] text-[#2c302e] px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-[#2c302e] hover:text-white transition-all duration-300 rounded-none"
              >
                ENVOYER UNE INSPIRATION
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Preview (Storefront) */}
      <section id="collection" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Celles qu'on <span className="font-serif italic font-light">emporte toujours.</span>
            </h2>
          </div>
          
          <ProductGrid limit={6} />

          <div className="mt-16 text-center">
            <Link 
              href="/shop" 
              className="inline-block bg-transparent border border-[#2c302e] text-[#2c302e] px-10 py-4 font-bold tracking-wider uppercase text-sm hover:bg-[#2c302e] hover:text-white transition-all duration-300 rounded-none"
            >
              Voir toute la boutique
            </Link>
          </div>
        </div>
      </section>

      {/* Le Journal */}
      <section className="py-24 bg-[#f9f6f0] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">
            Ce qu'on lit en attendant <span className="font-serif italic font-light">le grand jour.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="border-t border-stone-300 pt-6">
              <p className="text-xs font-bold text-[#8c7b65] uppercase tracking-widest mb-3">Mariage · 12 mars 2026</p>
              <h3 className="text-2xl font-bold mb-3">Comment choisir son bouquet de mariée</h3>
              <p className="text-stone-600">Quatre questions à se poser avant de choisir le bouquet qui vous suivra dans toutes vos photos.</p>
            </article>
            <article className="border-t border-stone-300 pt-6">
              <p className="text-xs font-bold text-[#8c7b65] uppercase tracking-widest mb-3">Cérémonie · 28 fév 2026</p>
              <h3 className="text-2xl font-bold mb-3">5 idées déco pour une soutenance réussie</h3>
              <p className="text-stone-600">La salle est austère. Votre famille attend dans le hall. Voici comment transformer le moment.</p>
            </article>
            <article className="border-t border-stone-300 pt-6">
              <p className="text-xs font-bold text-[#8c7b65] uppercase tracking-widest mb-3">Atelier · 14 fév 2026</p>
              <h3 className="text-2xl font-bold mb-3">Pourquoi les fleurs artificielles reviennent en force</h3>
              <p className="text-stone-600">Longtemps boudées, les fleurs artificielles connaissent une renaissance. Voici ce qui a changé.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c302e] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h3 className="text-3xl font-serif italic font-light mb-6">Recevez notre journal floral.</h3>
              <p className="text-stone-400 mb-8 max-w-md">Une lettre par saison. Histoires d'atelier, nouvelles compositions, et les dates de nos pop-ups à Alger.</p>
              <form className="flex border-b border-stone-600 pb-2 max-w-md">
                <input 
                  type="email" 
                  placeholder="votre.adresse@email.dz" 
                  className="bg-transparent border-none outline-none flex-1 text-white placeholder-stone-500"
                />
                <button type="submit" className="text-xs font-bold uppercase tracking-widest hover:text-[#8c7b65] transition-colors">
                  JE M'INSCRIS
                </button>
              </form>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-[#8c7b65] mb-6">Maison</h4>
                <ul className="space-y-4 text-stone-300 text-sm">
                  <li><Link href="#collection" className="hover:text-white transition-colors">Collection</Link></li>
                  <li><Link href="/composer" className="hover:text-white transition-colors">Composer</Link></li>
                  <li><Link href="/composer" className="hover:text-white transition-colors">Inspiration</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Journal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-[#8c7b65] mb-6">Atelier</h4>
                <ul className="space-y-4 text-stone-300 text-sm">
                  <li>Alger Centre</li>
                  <li>Livraison Algérie</li>
                  <li>+213 (0)5 55 00 00 00</li>
                  <li>bonjour@hikayatooki.dz</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-[#8c7b65] mb-6">Suivez-nous</h4>
                <ul className="space-y-4 text-stone-300 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">@hikayatooki</a></li>
                  <li className="font-arabic text-lg mt-4 text-white">حكايتك تبدأ هنا.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
            <p>© 2026 Hikayatooki — Tous droits réservés.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-stone-300">Mentions légales</Link>
              <Link href="#" className="hover:text-stone-300">Politique de confidentialité</Link>
              <Link href="#" className="hover:text-stone-300">Conditions de vente</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
