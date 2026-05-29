import { getProductById } from "@/app/actions/product";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import { ShieldCheck, Sparkles, HeartHandshake, Leaf } from "lucide-react";

function getContrastColor(hexColor: string): string {
  if (!hexColor || hexColor.length < 6) return "#ffffff";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#1c1917" : "#ffffff";
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Produit Introuvable | Hikayatki",
    };
  }
  return {
    title: `${product.name} | Hikayatki`,
    description: product.description || "Découvrez notre collection chez Hikayatki.",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || !product.is_visible) {
    notFound();
  }

  // Fallback for gallery if product_images is empty
  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((img: any) => img.image_url)
      : product.image_url
      ? [product.image_url]
      : [];

  const mainCategory = product.sub_category?.main_category;
  const subCategory = product.sub_category;

  return (
    <main className="min-h-screen bg-[#f9f6f0] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-10">
          <Link href="/" className="hover:text-[#8c7b65] transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#8c7b65] transition-colors">
            Boutique
          </Link>
          {mainCategory && (
            <>
              <span>/</span>
              <span className="text-stone-400 capitalize">{mainCategory.name}</span>
            </>
          )}
          {subCategory && (
            <>
              <span>/</span>
              <span className="text-stone-400 capitalize">{subCategory.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[#8c7b65] font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-stone-200/60 p-6 sm:p-8 shadow-sm">
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductGallery images={images} name={product.name} />
          </div>

          {/* Right: Info (6 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Badge */}
              <div className="flex items-center gap-3">
                {subCategory && (
                  <span className="bg-[#8c7b65]/10 text-[#8c7b65] text-xs font-bold uppercase tracking-wider px-3 py-1">
                    {subCategory.name}
                  </span>
                )}
                {subCategory?.is_composable && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200">
                    ✦ Composable
                  </span>
                )}
                {product.tag_label && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border select-none shadow-xs"
                    style={{
                      backgroundColor: product.tag_bg_color || "#8c7b65",
                      borderColor: `${product.tag_bg_color || "#8c7b65"}dd`,
                      color: getContrastColor(product.tag_bg_color || "#8c7b65"),
                    }}
                  >
                    {product.tag_label}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#2c302e] mb-3">
                  {product.name}
                </h1>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-[#8c7b65]">
                  {product.price.toLocaleString("fr-FR")} DA
                </p>
              </div>

              {/* Short Description */}
              <p className="text-stone-600 leading-relaxed text-sm border-b border-stone-100 pb-6">
                {product.description}
              </p>

              {/* Detailed Description */}
              {product.detailed_description && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#2c302e] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#8c7b65]" />
                    À propos de cette création
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line bg-stone-50/50 p-4 border border-stone-100">
                    {product.detailed_description}
                  </p>
                </div>
              )}

              {/* Specific Details: Flower Type & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {product.flower_type && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[#2c302e] flex items-center gap-1.5">
                      <Leaf size={14} className="text-[#8c7b65]" />
                      Types de Fleurs
                    </h4>
                    <p className="text-stone-600 text-sm capitalize">{product.flower_type}</p>
                  </div>
                )}
                {product.sizes && (
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[#2c302e] flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#8c7b65]" />
                      Dimensions / Options
                    </h4>
                    <p className="text-stone-600 text-sm">{product.sizes}</p>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              {product.care_instructions && (
                <div className="space-y-2 border-t border-stone-100 pt-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#2c302e] flex items-center gap-1.5">
                    <HeartHandshake size={14} className="text-[#8c7b65]" />
                    Conseils d&apos;Entretien
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed bg-amber-50/20 border border-amber-200/30 p-4 italic">
                    &ldquo;{product.care_instructions}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Cart Integration Button */}
            <div className="pt-8 border-t border-stone-100 mt-8">
              <AddToCartButton product={product} />
              <p className="text-center text-xs text-stone-400 mt-3 leading-relaxed">
                ✓ Préparation artisanale à la demande &bull; Livraison Yalidine disponible dans 58 wilayas
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
