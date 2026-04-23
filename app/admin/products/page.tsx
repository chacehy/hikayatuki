import { getProducts } from "@/app/actions/product";
import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-[#2c302e]">Produits</h1>
        <p className="text-stone-500 mt-1">Gérez votre catalogue de boutique</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 border border-stone-200 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-[#2c302e] mb-6">Nouveau Produit</h2>
            <ProductForm />
          </div>
        </div>

        <div className="lg:col-span-2">
          <ProductList initialProducts={products} />
        </div>
      </div>
    </div>
  );
}
