import { supabase } from "@/lib/supabase";
import { confirmOrder, cancelOrder } from "@/app/actions/order";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-background-soft)] p-8 flex flex-col items-center justify-center">
        <p className="text-stone-500 mb-4">Commande introuvable.</p>
        <Link href="/admin" className="text-[#8c7b65] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-stone-500 hover:text-[#2c302e] transition-colors uppercase tracking-widest text-xs font-bold">
            <ArrowLeft size={16} /> Retour au tableau de bord
          </Link>
        </div>

        <div className="bg-white border border-stone-200 shadow-sm">
          <header className="bg-stone-50 border-b border-stone-200 p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
            <div>
               <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Détails Client</p>
               <h1 className="text-3xl font-bold text-[#2c302e] mb-1">{order.full_name || "Anonyme"}</h1>
               <p className="text-stone-500 font-mono tracking-widest">{order.phone_number}</p>
            </div>
            <div className="flex flex-col items-end">
               <span className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${
                  order.status === 'CONFIRMED' ? 'bg-[#f0ece1] text-[#6e5f4d]' : 
                  order.status === 'CANCELLED' ? 'bg-stone-200 text-stone-500' : 
                  'bg-[#eec170] text-stone-900'
                }`}>
                  {order.status === 'CONFIRMED' ? 'Confirmée' : 
                   order.status === 'CANCELLED' ? 'Annulée' : 'En Attente'}
              </span>
              <span className="text-stone-400 text-sm mt-2 font-mono">
                {new Date(order.created_at).toLocaleString("fr-FR", {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </header>

          <div className="p-8 grid md:grid-cols-[1fr_minmax(0,300px)] gap-10">
            {/* Items */}
            <div className="space-y-8">
              <div>
                <h2 className="text-sm text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Informations de Livraison</h2>
                <div className="bg-stone-50/50 p-4 border border-stone-100 flex flex-col gap-2">
                  <p><span className="font-bold text-stone-600">Wilaya:</span> {order.wilaya || <span className="italic text-stone-400">Non renseignée</span>}</p>
                  <p><span className="font-bold text-stone-600">Commune:</span> {order.commune || <span className="italic text-stone-400">Non renseignée</span>}</p>
                  <p><span className="font-bold text-stone-600">Adresse:</span> {order.address || <span className="italic text-stone-400">Non renseignée</span>}</p>
                  {order.yalidine_tracking && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p><span className="font-bold text-[#8c7b65]">Tracking Yalidine:</span> <span className="font-mono bg-white px-2 py-1 border border-stone-200">{order.yalidine_tracking}</span></p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Articles Sélectionnés</h2>
              {order.items && order.items.length > 0 ? (
                <ul className="space-y-3">
                  {order.items.map((it: any, idx: number) => (
                    <li key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 bg-stone-50/50 p-3 border border-stone-100">
                      <span className="text-[#2c302e] font-bold">{it.item}</span>
                      <span className="text-xs text-stone-400 font-medium">dans {it.category}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500 italic text-sm">Pas d'articles du catalogue sélectionnés.</p>
              )}
            </div>
            </div>

            {/* Photo / Actions */}
            <div className="space-y-8">
              {order.photo_url && (
                <div>
                  <h2 className="text-sm text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">Photo d'inspiration</h2>
                  <a href={order.photo_url} target="_blank" rel="noreferrer" className="block border-4 border-stone-100 hover:border-[#8c7b65] transition-colors relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={order.photo_url} 
                      alt="Inspiration" 
                      className="w-full h-auto object-contain bg-stone-50"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <span className="text-white text-xs font-bold uppercase tracking-widest">Agrandir</span>
                    </div>
                  </a>
                </div>
              )}

              {order.status !== 'CONFIRMED' && order.status !== 'CANCELLED' && (
                <div className="flex flex-col gap-3">
                  <form action={confirmOrder} className="bg-stone-50 p-4 border border-stone-200 shadow-sm flex flex-col gap-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <div>
                      <label htmlFor="price" className="block text-xs font-bold text-stone-600 uppercase tracking-widest mb-2">Prix Final (DA)</label>
                      <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        placeholder="0"
                        required
                        className="w-full border border-stone-300 px-3 py-2 focus:outline-none focus:border-[#8c7b65]"
                      />
                      <p className="text-xs text-stone-400 mt-1">Nécessaire pour créer le colis Yalidine</p>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-[#2c302e] text-white hover:bg-black font-bold py-3 transition-colors tracking-widest uppercase text-sm border-none rounded-none shadow-md mt-2"
                    >
                      Confirmer & Envoyer à Yalidine
                    </button>
                  </form>
                  <form action={cancelOrder}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button 
                      type="submit"
                      className="w-full bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-700 font-bold py-3 transition-colors tracking-widest uppercase text-sm border-none rounded-none"
                    >
                      Annuler la Commande
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
