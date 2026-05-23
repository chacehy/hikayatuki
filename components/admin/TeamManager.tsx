"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateStaffPermissions,
  deleteStaffMember,
  addStaffMember,
} from "@/app/actions/auth";
import { UserPlus, Trash2, Loader2, Shield, Check, Info } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  can_manage_inventory: boolean;
  can_view_orders: boolean;
  can_manage_yalidine: boolean;
  created_at: string;
}

interface TeamManagerProps {
  initialStaff: StaffMember[];
  currentAdminId: string;
}

export default function TeamManager({ initialStaff, currentAdminId }: TeamManagerProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  
  // Add member form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const router = useRouter();

  useEffect(() => {
    setStaffList(initialStaff);
  }, [initialStaff]);

  const handlePermissionToggle = async (
    staffId: string,
    field: "can_manage_inventory" | "can_view_orders" | "can_manage_yalidine",
    currentVal: boolean
  ) => {
    setLoadingRowId(staffId);
    
    // Find member to build full updates payload
    const member = staffList.find((s) => s.id === staffId);
    if (!member) {
      setLoadingRowId(null);
      return;
    }

    const updates = {
      can_manage_inventory: member.can_manage_inventory,
      can_view_orders: member.can_view_orders,
      can_manage_yalidine: member.can_manage_yalidine,
      [field]: !currentVal,
    };

    const result = await updateStaffPermissions(staffId, updates);
    if (result.success) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, ...updates } : s))
      );
    } else {
      alert(result.error || "Erreur lors de la modification des permissions.");
    }
    setLoadingRowId(null);
  };

  const handleDelete = async (staffId: string) => {
    if (staffId === currentAdminId) {
      alert("Vous ne pouvez pas supprimer votre propre compte administrateur.");
      return;
    }

    if (
      confirm(
        "Êtes-vous sûr de vouloir retirer ce membre du personnel ? Il perdra immédiatement l'accès au tableau de bord."
      )
    ) {
      setLoadingRowId(staffId);
      const result = await deleteStaffMember(staffId);
      if (result.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== staffId));
        router.refresh();
      } else {
        alert(result.error || "Erreur lors de la suppression.");
      }
      setLoadingRowId(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError("");
    setAddSuccess("");

    if (password.length < 6) {
      setAddError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsAdding(false);
      return;
    }

    const result = await addStaffMember(email, password);
    if (result.success) {
      setAddSuccess("Le membre du personnel a été ajouté avec succès !");
      setEmail("");
      setPassword("");
      router.refresh();
    } else {
      setAddError(result.error || "Erreur lors de l'inscription.");
    }
    setIsAdding(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Staff List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="font-bold text-lg text-[#2c302e] flex items-center gap-2">
              <Shield size={18} className="text-[#8c7b65]" />
              Membres de l&apos;Équipe
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {staffList.length} au total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 font-medium">
                  <th className="px-6 py-4">Utilisateur / Email</th>
                  <th className="px-6 py-4 text-center">Inventaire</th>
                  <th className="px-6 py-4 text-center">Commandes</th>
                  <th className="px-6 py-4 text-center">Yalidine</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {staffList.map((member) => {
                  const isSelf = member.id === currentAdminId;
                  const isMainAdmin = member.role === "main_admin";

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-stone-50/30 transition-colors ${
                        isMainAdmin ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-[#2c302e] flex items-center gap-1.5">
                            {member.email}
                            {isSelf && (
                              <span className="text-[10px] bg-[#8c7b65]/10 text-[#8c7b65] px-1.5 py-0.5 font-bold uppercase">
                                Vous
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-stone-400 capitalize">
                            Rôle: {isMainAdmin ? "Administrateur Principal" : "Personnel"}
                          </p>
                        </div>
                      </td>

                      {/* Permissions columns */}
                      <td className="px-6 py-4 text-center">
                        {isMainAdmin ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-800">
                            <Check size={14} />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={member.can_manage_inventory}
                            disabled={loadingRowId === member.id}
                            onChange={() =>
                              handlePermissionToggle(
                                member.id,
                                "can_manage_inventory",
                                member.can_manage_inventory
                              )
                            }
                            className="w-4 h-4 accent-[#8c7b65] cursor-pointer disabled:opacity-50"
                          />
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isMainAdmin ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-800">
                            <Check size={14} />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={member.can_view_orders}
                            disabled={loadingRowId === member.id}
                            onChange={() =>
                              handlePermissionToggle(
                                member.id,
                                "can_view_orders",
                                member.can_view_orders
                              )
                            }
                            className="w-4 h-4 accent-[#8c7b65] cursor-pointer disabled:opacity-50"
                          />
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isMainAdmin ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100 text-amber-800">
                            <Check size={14} />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={member.can_manage_yalidine}
                            disabled={loadingRowId === member.id}
                            onChange={() =>
                              handlePermissionToggle(
                                member.id,
                                "can_manage_yalidine",
                                member.can_manage_yalidine
                              )
                            }
                            className="w-4 h-4 accent-[#8c7b65] cursor-pointer disabled:opacity-50"
                          />
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {loadingRowId === member.id && (
                            <Loader2 size={16} className="animate-spin text-stone-400" />
                          )}
                          {!isMainAdmin && (
                            <button
                              onClick={() => handleDelete(member.id)}
                              disabled={loadingRowId !== null}
                              className="p-2 text-stone-400 hover:text-rose-500 disabled:opacity-50 transition-colors"
                              title="Retirer le membre"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/50 p-4 text-amber-900 text-xs flex gap-3">
          <Info size={16} className="flex-shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">À propos des permissions :</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li><strong>Inventaire :</strong> Permet de modifier les Catégories, Produits et Matières premières.</li>
              <li><strong>Commandes :</strong> Permet d&apos;afficher le tableau de bord principal et le détail des commandes.</li>
              <li><strong>Yalidine :</strong> Permet d&apos;accéder au module d&apos;expédition Yalidine Express.</li>
              <li>L&apos;Administrateur Principal possède toutes les permissions de manière immuable.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Member Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 border border-stone-200 shadow-sm sticky top-8">
          <h3 className="font-bold text-lg text-[#2c302e] mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-[#8c7b65]" />
            Ajouter un Membre
          </h3>

          {addError && (
            <div className="bg-rose-50 text-rose-600 p-3 text-xs border border-rose-200 mb-4 font-medium">
              {addError}
            </div>
          )}

          {addSuccess && (
            <div className="bg-emerald-50 text-emerald-700 p-3 text-xs border border-emerald-200 mb-4 font-medium">
              {addSuccess}
            </div>
          )}

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label
                htmlFor="staffEmail"
                className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1"
              >
                Adresse Email
              </label>
              <input
                type="email"
                id="staffEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@compte.com"
                className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
              />
            </div>

            <div>
              <label
                htmlFor="staffPassword"
                className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1"
              >
                Mot de passe initial
              </label>
              <input
                type="password"
                id="staffPassword"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] bg-white text-[#2c302e]"
              />
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-[#2c302e] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 mt-4"
            >
              {isAdding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Créer le compte personnel"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
