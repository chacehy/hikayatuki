"use client";

import { useState, useEffect, useRef } from "react";
import {
  getWilayas,
  getCommunesByWilaya,
  getCentersByWilaya,
  getDeliveryFee,
} from "@/app/actions/yalidine";
import {
  MapPin,
  ChevronDown,
  Building2,
  Truck,
  Package,
  Check,
  Search,
  Loader2,
} from "lucide-react";

interface DeliveryData {
  wilayaId: number;
  wilayaName: string;
  communeId: number;
  communeName: string;
  address: string;
  deliveryType: "home" | "desk";
  deliveryFee: number;
  stopDeskId?: number;
  stopDeskName?: string;
}

interface DeliveryAddressSelectorProps {
  onDeliveryChange: (data: DeliveryData) => void;
  darkMode?: boolean;
}

export default function DeliveryAddressSelector({
  onDeliveryChange,
  darkMode = false,
}: DeliveryAddressSelectorProps) {
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [fee, setFee] = useState<any>(null);

  const [selectedWilaya, setSelectedWilaya] = useState<any>(null);
  const [selectedCommune, setSelectedCommune] = useState<any>(null);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [address, setAddress] = useState("");

  const [wilayaSearch, setWilayaSearch] = useState("");
  const [communeSearch, setCommuneSearch] = useState("");
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [showCommuneDropdown, setShowCommuneDropdown] = useState(false);

  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);

  const wilayaRef = useRef<HTMLDivElement>(null);
  const communeRef = useRef<HTMLDivElement>(null);

  // Load wilayas on mount
  useEffect(() => {
    getWilayas().then(setWilayas);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wilayaRef.current && !wilayaRef.current.contains(e.target as Node)) {
        setShowWilayaDropdown(false);
      }
      if (communeRef.current && !communeRef.current.contains(e.target as Node)) {
        setShowCommuneDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load communes + centers when wilaya changes; fees fetched separately
  useEffect(() => {
    if (selectedWilaya) {
      setLoadingCommunes(true);
      setLoadingCenters(true);
      setLoadingFee(true);
      setSelectedCommune(null);
      setSelectedCenter(null);
      setCommuneSearch("");
      setFee(null);

      // Fetch communes + centers from cached Supabase data
      Promise.all([
        getCommunesByWilaya(selectedWilaya.id),
        getCentersByWilaya(selectedWilaya.id),
      ]).then(([c, ct]) => {
        setCommunes(c);
        setCenters(ct);
        setLoadingCommunes(false);
        setLoadingCenters(false);
      });

      // Fetch fees from Yalidine API (on-demand)
      // Store wilaya = 16 (Alger) by default, configurable
      const STORE_WILAYA_ID = 16;
      getDeliveryFee(STORE_WILAYA_ID, selectedWilaya.id).then((f) => {
        setFee(f);
        setLoadingFee(false);
      }).catch(() => {
        setLoadingFee(false);
      });
    }
  }, [selectedWilaya]);

  // Emit changes
  useEffect(() => {
    if (selectedWilaya && selectedCommune) {
      let homeFee = 0;
      let deskFee = 0;
      if (fee?.per_commune && fee.per_commune[selectedCommune.id]) {
        const communeFee = fee.per_commune[selectedCommune.id];
        homeFee = communeFee.express_home || 0;
        deskFee = communeFee.express_desk || 0;
      }

      // If stopdesk is disabled (deskFee === 0), fallback to home delivery
      const actualDeliveryType = (deliveryType === "desk" && deskFee === 0) ? "home" : deliveryType;
      const deliveryFee = actualDeliveryType === "desk" ? deskFee : homeFee;

      onDeliveryChange({
        wilayaId: selectedWilaya.id,
        wilayaName: selectedWilaya.name,
        communeId: selectedCommune.id,
        communeName: selectedCommune.name,
        address,
        deliveryType,
        deliveryFee,
        stopDeskId: selectedCenter?.center_id,
        stopDeskName: selectedCenter?.name,
      });
    }
  }, [selectedWilaya, selectedCommune, address, deliveryType, selectedCenter, fee]);

  const filteredWilayas = wilayas.filter(
    (w) =>
      w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
      String(w.id).includes(wilayaSearch)
  );

  const filteredCommunes = communes.filter((c) =>
    c.name.toLowerCase().includes(communeSearch.toLowerCase())
  );

  const bg = darkMode ? "bg-[#1a1c1b]" : "bg-white";
  const border = darkMode ? "border-stone-700" : "border-stone-300";
  const text = darkMode ? "text-white" : "text-[#2c302e]";
  const textMuted = darkMode ? "text-stone-400" : "text-stone-500";
  const dropdownBg = darkMode ? "bg-[#232523]" : "bg-white";
  const hoverBg = darkMode ? "hover:bg-[#2c302e]" : "hover:bg-stone-50";
  const focusBorder = "focus:border-[#8c7b65]";

  return (
    <div className="space-y-4">
      {/* Wilaya Selector */}
      <div ref={wilayaRef} className="relative">
        <label className={`block text-sm ${textMuted} mb-2`}>
          <MapPin size={14} className="inline mr-1" />
          Wilaya
        </label>
        <div
          className={`${bg} border ${border} px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${focusBorder} ${text}`}
          onClick={() => setShowWilayaDropdown(!showWilayaDropdown)}
        >
          <span className={selectedWilaya ? text : textMuted}>
            {selectedWilaya
              ? `${String(selectedWilaya.id).padStart(2, "0")} - ${selectedWilaya.name}`
              : "Sélectionner une wilaya..."}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${showWilayaDropdown ? "rotate-180" : ""} ${textMuted}`}
          />
        </div>

        {showWilayaDropdown && (
          <div
            className={`absolute z-50 w-full mt-1 ${dropdownBg} border ${border} shadow-xl max-h-64 overflow-hidden flex flex-col`}
          >
            <div className={`p-2 border-b ${border}`}>
              <div className={`flex items-center gap-2 ${bg} border ${border} px-3 py-2`}>
                <Search size={14} className={textMuted} />
                <input
                  type="text"
                  value={wilayaSearch}
                  onChange={(e) => setWilayaSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className={`w-full bg-transparent ${text} text-sm outline-none placeholder:${textMuted}`}
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredWilayas.map((w) => (
                <div
                  key={w.id}
                  className={`px-4 py-2.5 cursor-pointer ${hoverBg} flex items-center justify-between text-sm ${text} transition-colors`}
                  onClick={() => {
                    setSelectedWilaya(w);
                    setShowWilayaDropdown(false);
                    setWilayaSearch("");
                  }}
                >
                  <span>
                    <span className={`font-mono ${textMuted} mr-2`}>
                      {String(w.id).padStart(2, "0")}
                    </span>
                    {w.name}
                  </span>
                  {selectedWilaya?.id === w.id && (
                    <Check size={14} className="text-[#8c7b65]" />
                  )}
                </div>
              ))}
              {filteredWilayas.length === 0 && (
                <div className={`p-4 text-center ${textMuted} text-sm`}>
                  Aucune wilaya trouvée.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Commune Selector */}
      {selectedWilaya && (
        <div ref={communeRef} className="relative">
          <label className={`block text-sm ${textMuted} mb-2`}>
            <Building2 size={14} className="inline mr-1" />
            Commune
          </label>
          {loadingCommunes ? (
            <div className={`${bg} border ${border} px-4 py-3 flex items-center gap-2 ${textMuted} text-sm`}>
              <Loader2 size={14} className="animate-spin" />
              Chargement...
            </div>
          ) : (
            <>
              <div
                className={`${bg} border ${border} px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${focusBorder} ${text}`}
                onClick={() => setShowCommuneDropdown(!showCommuneDropdown)}
              >
                <span className={selectedCommune ? text : textMuted}>
                  {selectedCommune
                    ? selectedCommune.name
                    : "Sélectionner une commune..."}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showCommuneDropdown ? "rotate-180" : ""} ${textMuted}`}
                />
              </div>

              {showCommuneDropdown && (
                <div
                  className={`absolute z-50 w-full mt-1 ${dropdownBg} border ${border} shadow-xl max-h-52 overflow-hidden flex flex-col`}
                >
                  <div className={`p-2 border-b ${border}`}>
                    <div className={`flex items-center gap-2 ${bg} border ${border} px-3 py-2`}>
                      <Search size={14} className={textMuted} />
                      <input
                        type="text"
                        value={communeSearch}
                        onChange={(e) => setCommuneSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className={`w-full bg-transparent ${text} text-sm outline-none`}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredCommunes.map((c) => (
                      <div
                        key={c.id}
                        className={`px-4 py-2.5 cursor-pointer ${hoverBg} flex items-center justify-between text-sm ${text} transition-colors`}
                        onClick={() => {
                          setSelectedCommune(c);
                          setShowCommuneDropdown(false);
                          setCommuneSearch("");
                        }}
                      >
                        <span>{c.name}</span>
                        {selectedCommune?.id === c.id && (
                          <Check size={14} className="text-[#8c7b65]" />
                        )}
                      </div>
                    ))}
                    {filteredCommunes.length === 0 && (
                      <div className={`p-4 text-center ${textMuted} text-sm`}>
                        Aucune commune trouvée.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delivery Type Selector */}
      {selectedCommune && (() => {
        let deskFee = 0;
        if (fee?.per_commune && fee.per_commune[selectedCommune.id]) {
          deskFee = fee.per_commune[selectedCommune.id].express_desk || 0;
        }
        const canStopDesk = deskFee > 0 && centers.length > 0;

        return (
          <div>
            <label className={`block text-sm ${textMuted} mb-2`}>
              Type de livraison
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType("home");
                  setSelectedCenter(null);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 border text-sm font-bold transition-all ${
                  deliveryType === "home"
                    ? "border-[#8c7b65] bg-[#f0ece1] text-[#6e5f4d]"
                    : `${border} ${bg} ${text} ${hoverBg}`
                }`}
              >
                <Truck size={16} />
                À Domicile
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("desk")}
                disabled={!canStopDesk}
                className={`flex items-center justify-center gap-2 px-4 py-3 border text-sm font-bold transition-all ${
                  deliveryType === "desk"
                    ? "border-[#8c7b65] bg-[#f0ece1] text-[#6e5f4d]"
                    : `${border} ${bg} ${text} ${hoverBg}`
                } ${!canStopDesk ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <Package size={16} />
                Stop Desk
              </button>
            </div>

            {/* Delivery Fee Display */}
            {fee && !loadingFee && (() => {
              const communeFee = fee?.per_commune?.[selectedCommune.id];
              const homeFee = communeFee?.express_home || 0;
              const displayFee = deliveryType === "desk" ? deskFee : homeFee;
              return (
                <div className={`mt-3 p-3 border ${border} ${bg} flex items-center justify-between`}>
                  <span className={`text-sm ${textMuted}`}>
                    Frais de livraison ({deliveryType === "desk" ? "Stop Desk" : "Domicile"})
                  </span>
                  <span className={`font-bold font-mono ${text}`}>
                    {Number(displayFee).toFixed(0)} DA
                  </span>
                </div>
              );
            })()}
            {loadingFee && selectedCommune && (
              <div className={`mt-3 p-3 border ${border} ${bg} flex items-center gap-2 ${textMuted} text-sm`}>
                <Loader2 size={14} className="animate-spin" />
                Calcul des frais...
              </div>
            )}
          </div>
        );
      })()}

      {/* Stop Desk Selector */}
      {deliveryType === "desk" && centers.length > 0 && (
        <div>
          <label className={`block text-sm ${textMuted} mb-2`}>
            <Package size={14} className="inline mr-1" />
            Point de retrait
          </label>
          <div className="space-y-2">
            {centers.map((c) => (
              <div
                key={c.center_id}
                onClick={() => setSelectedCenter(c)}
                className={`p-3 border cursor-pointer transition-all ${
                  selectedCenter?.center_id === c.center_id
                    ? "border-[#8c7b65] bg-[#f0ece1]"
                    : `${border} ${bg} ${hoverBg}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold text-sm ${text}`}>{c.name}</p>
                    {c.address && (
                      <p className={`text-xs ${textMuted} mt-0.5`}>{c.address}</p>
                    )}
                  </div>
                  {selectedCenter?.center_id === c.center_id && (
                    <Check size={16} className="text-[#8c7b65]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Field (for home delivery) */}
      {deliveryType === "home" && selectedCommune && (
        <div>
          <label className={`block text-sm ${textMuted} mb-2`}>
            Adresse complète
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Cité 200 logements, Bâtiment B"
            className={`w-full ${bg} border ${border} ${text} px-4 py-3 ${focusBorder} transition-colors rounded-none outline-none`}
          />
        </div>
      )}
    </div>
  );
}
