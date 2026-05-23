import { getStaffMembers, verifyPermission } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import TeamManager from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  // Only the Main Admin is allowed to access team management
  const currentUser = await verifyPermission();
  if (!currentUser || currentUser.role !== "main_admin") {
    redirect("/admin");
  }

  const staffMembers = await getStaffMembers();

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold text-[#2c302e]">Gestion de l&apos;Équipe</h1>
        <p className="text-stone-500 mt-1">
          Gérez l&apos;accès au tableau de bord pour les membres de votre personnel.
        </p>
      </header>

      <TeamManager initialStaff={staffMembers} currentAdminId={currentUser.id} />
    </div>
  );
}
