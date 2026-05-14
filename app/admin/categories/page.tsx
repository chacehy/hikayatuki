import { getMainCategories } from "@/app/actions/category";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getMainCategories();

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-[#2c302e]">Catégories</h1>
        <p className="text-stone-500 mt-1">
          Gérez la hiérarchie des catégories et les sous-catégories composables
        </p>
      </header>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
