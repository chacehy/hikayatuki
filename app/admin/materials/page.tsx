import { getRawMaterials } from "@/app/actions/raw-material";
import MaterialForm from "@/components/admin/MaterialForm";
import MaterialList from "@/components/admin/MaterialList";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  const materials = await getRawMaterials();

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-[#2c302e]">Matières Premières</h1>
        <p className="text-stone-500 mt-1">
          Gérez les matières premières disponibles pour le compositeur
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 border border-stone-200 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-[#2c302e] mb-6">
              Nouvelle Matière
            </h2>
            <MaterialForm />
          </div>
        </div>

        <div className="lg:col-span-2">
          <MaterialList initialMaterials={materials} />
        </div>
      </div>
    </div>
  );
}
