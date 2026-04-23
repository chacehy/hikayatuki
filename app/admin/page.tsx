import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, full_name, phone_number, created_at, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div>Erreur de chargement des commandes.</div>;
  }

  return (
    <>
      <header className="mb-10 pb-4 border-b border-stone-200 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#2c302e]">Tableau de Bord</h1>
          <p className="text-stone-500 mt-1">Gestion des commandes Hikayatki</p>
        </div>
        <div className="bg-[#8c7b65] text-white px-4 py-2 font-bold text-sm">
          {orders?.length || 0} Total
        </div>
      </header>

      {(!orders || orders.length === 0) ? (
        <div className="bg-white p-12 text-center text-stone-500 border border-stone-200">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link 
              href={`/admin/orders/${order.id}`}
              key={order.id} 
              className={`block bg-white border ${['CONFIRMED', 'CANCELLED'].includes(order.status) ? 'border-stone-200/50 opacity-60' : 'border-stone-200 hover:border-[#8c7b65]'} p-5 shadow-sm transition-colors group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                  <div className="flex items-center gap-3 w-40">
                    <span className={`px-2 py-1 text-xs font-bold tracking-wider uppercase ${
                      order.status === 'CONFIRMED' ? 'bg-[#f0ece1] text-[#6e5f4d]' : 
                      order.status === 'CANCELLED' ? 'bg-stone-200 text-stone-500' :
                      'bg-[#eec170] text-stone-900'
                    }`}>
                      {order.status === 'CONFIRMED' ? 'Confirmée' : 
                       order.status === 'CANCELLED' ? 'Annulée' : 'Nouvelle'}
                    </span>
                  </div>
                  
                  <div className="w-48">
                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-mono text-stone-600">
                      {new Date(order.created_at).toLocaleString("fr-FR", {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Client</p>
                    <p className="font-bold text-[#2c302e]">
                      {order.full_name || "Anonyme"} 
                      <span className="font-normal text-stone-400 ml-2">{order.phone_number}</span>
                    </p>
                  </div>
                </div>

                <div className="text-stone-300 group-hover:text-[#8c7b65] transition-colors">
                  <ArrowRight size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

