import { verifyPermission } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewProductFormWrapper from "./NewProductFormWrapper";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200">
        <Link
          href="/admin/products"
          className="text-xs text-[#8c7b65] hover:text-[#5f5343] transition-colors inline-flex items-center gap-1.5 font-bold uppercase tracking-wider mb-2"
        >
          <ArrowLeft size={14} /> Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-[#2c302e]">Nouveau Produit</h1>
        <p className="text-stone-500 mt-1">Créez un nouveau produit et ajoutez-le au catalogue</p>
      </header>

      <div className="bg-white p-8 border border-stone-200 shadow-sm max-w-3xl">
        <NewProductFormWrapper />
      </div>
    </div>
  );
}
