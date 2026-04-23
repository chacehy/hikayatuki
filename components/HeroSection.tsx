"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import heroBg from "@/assets/hikayatookiPics/heropageflowertable.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={heroBg} 
          alt="Hikayatooki Table Decor" 
          fill 
          priority
          className="object-cover"
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-semibold tracking-[0.2em] uppercase text-sm mb-4"
          >
            HIKAYATOOKI — حكايتك
          </motion.h2>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Chaque moment <br/>
            <span className="font-serif italic font-light">mérite sa fleur.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-xl mb-10 text-stone-100 font-light leading-relaxed max-w-md"
          >
            L'art floral qui dure. Pour vos mariages, fiançailles, cérémonies et souvenirs qu'on ne jette pas.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="#collection" 
              className="bg-white text-black px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-stone-200 transition-all duration-300 rounded-none shadow-lg text-center"
            >
              DÉCOUVRIR LA COLLECTION
            </Link>
            <Link 
              href="/composer" 
              className="bg-transparent border border-white text-white px-8 py-4 font-bold tracking-wider uppercase text-sm hover:bg-white hover:text-black transition-all duration-300 rounded-none text-center"
            >
              COMPOSER MON BOUQUET
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white z-10"
      >
        <span className="text-xs uppercase tracking-widest mb-2 font-medium">FAITES DÉFILER</span>
        <div className="w-[1px] h-12 bg-white/50 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-white absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
