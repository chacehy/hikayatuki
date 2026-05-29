import { getProducts } from "@/app/actions/product";
import ProductList from "@/components/admin/ProductList";
import { verifyPermission } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const staff = await verifyPermission("can_manage_inventory");
  if (!staff) {
    redirect("/login");
  }

  const products = await getProducts();

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2c302e]">Produits</h1>
          <p className="text-stone-500 mt-1">Gérez votre catalogue de boutique</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#2c302e] hover:bg-black text-white px-5 py-2.5 text-sm font-bold transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Ajouter un produit
        </Link>
      </header>

      <div className="w-full">
        <ProductList initialProducts={products} />
      </div>
    </div>
  );
}
