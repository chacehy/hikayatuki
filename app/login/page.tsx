"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, signUpAction } from "@/app/actions/auth";
import { LogIn, UserPlus, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (activeTab === "login") {
        const result = await loginAction(email, password);
        if (result.success) {
          router.push("/admin");
          router.refresh();
        } else {
          setErrorMsg(result.error || "Erreur de connexion.");
        }
      } else {
        const result = await signUpAction(email, password);
        if (result.success) {
          if ((result as any).needsConfirmation) {
            setSuccessMsg(
              "Compte créé avec succès! Veuillez vérifier votre boîte email pour confirmer votre compte, puis revenez vous connecter."
            );
          } else {
            setSuccessMsg(
              "Compte créé avec succès! Redirection vers le tableau de bord..."
            );
            setTimeout(() => {
              router.push("/admin");
              router.refresh();
            }, 2000);
          }
        } else {
          setErrorMsg(result.error || "Erreur lors de la création du compte.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 shadow-xl overflow-hidden">
        {/* Header/Logo */}
        <div className="p-8 pb-4 text-center bg-[#2c302e] text-white">
          <h1 className="text-4xl font-arabic text-[#8c7b65] mb-2">حكايتكي</h1>
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Espace Administration
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-100 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
              activeTab === "login"
                ? "bg-white text-[#2c302e] border-b-2 border-[#8c7b65]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <LogIn size={16} />
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
              activeTab === "signup"
                ? "bg-white text-[#2c302e] border-b-2 border-[#8c7b65]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <UserPlus size={16} />
            Inscription
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 p-4 text-sm border border-rose-200 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-4 text-sm border border-emerald-200 font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Adresse Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] transition-all bg-white text-[#2c302e]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#8c7b65] focus:ring-1 focus:ring-[#8c7b65] transition-all bg-white text-[#2c302e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2c302e] hover:bg-black text-white py-3.5 text-sm font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : activeTab === "login" ? (
              <>
                Se connecter
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {activeTab === "signup" && (
            <p className="text-xs text-stone-500 leading-relaxed text-center">
              * Note: Le premier compte créé deviendra automatiquement
              l&apos;Administrateur Principal. Les comptes suivants devront être
              approuvés.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
