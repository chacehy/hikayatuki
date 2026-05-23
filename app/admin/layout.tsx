import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, LayoutDashboard, FolderTree, Gem, Truck, Users, LogOut } from "lucide-react";
import { verifyPermission, logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check user session and profile
  const staff = await verifyPermission();
  if (!staff) {
    redirect("/login");
  }

  const isMainAdmin = staff.role === "main_admin";
  const canManageInventory = isMainAdmin || staff.can_manage_inventory;
  const canViewOrders = isMainAdmin || staff.can_view_orders;
  const canManageYalidine = isMainAdmin || staff.can_manage_yalidine;

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#2c302e] text-white flex flex-col">
        <div className="p-6 border-b border-stone-700">
          <Link href="/admin" className="text-2xl font-arabic text-[#8c7b65]">
            حكايتكي
          </Link>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
            {isMainAdmin ? "Main Admin" : "Staff"}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {canViewOrders && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none"
            >
              <LayoutDashboard size={18} />
              Vue d&apos;ensemble
            </Link>
          )}

          {canManageInventory && (
            <>
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none"
              >
                <FolderTree size={18} />
                Catégories
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none"
              >
                <Package size={18} />
                Produits
              </Link>
              <Link
                href="/admin/materials"
                className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none"
              >
                <Gem size={18} />
                Matières Premières
              </Link>
            </>
          )}

          {canManageYalidine && (
            <Link
              href="/admin/yalidine"
              className="flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-[#1a1c1b] hover:text-white transition-colors rounded-none"
            >
              <Truck size={18} />
              Livraison Yalidine
            </Link>
          )}

          {isMainAdmin && (
            <Link
              href="/admin/team"
              className="flex items-center gap-3 px-4 py-3 text-amber-200 hover:bg-[#1a1c1b] hover:text-amber-100 transition-colors rounded-none font-medium border-t border-stone-700/50 pt-4 mt-4"
            >
              <Users size={18} />
              Gestion de l&apos;Équipe
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-stone-700 space-y-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors py-2 px-4 cursor-pointer"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </form>
          <div className="px-4">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-400 transition-colors">
              &larr; Retour au site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
