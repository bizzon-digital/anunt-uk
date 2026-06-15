"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Rocket, Check, Loader2, ChevronDown, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PRET_MATRICE: Record<string, Record<string, number>> = {
  basic:  { "7 zile": 1.99, "14 zile": 2.99, "30 zile": 4.99, "60 zile": 7.99 },
  pro:    { "7 zile": 3.99, "14 zile": 5.99, "30 zile": 9.99, "60 zile": 15.99 },
  top:    { "7 zile": 6.99, "14 zile": 9.99, "30 zile": 18.99, "60 zile": 29.99 },
};

const PROMO_PLANS = [
  {
    id: "basic", name: "Basic",
    desc: "Sus in categorie · Evidentiata vizual",
    details: ["Sus in categoria ta", "Evidentiata vizual", "Reimprospatat automat"],
    color: "text-[#92400e]", bg: "bg-[#FEF3C7]",
  },
  {
    id: "pro", name: "Pro", popular: true,
    desc: "TOP pagina principala · Ribbon portocaliu",
    details: ["TOP pagina principala", "Ribbon portocaliu Promovat", "Notificare abonati", "Reimprospatat la 3 zile"],
    color: "text-red-600", bg: "bg-red-50",
  },
  {
    id: "top", name: "Top Plus",
    desc: "Pozitie #1 · Banner categorie · Push notification",
    details: ["Pozitie #1 in categorie", "Banner in pagina categoriei", "Push notification", "Reimprospatat zilnic"],
    color: "text-white", bg: "bg-[#E36414]",
  },
];

const DURATE = ["7 zile", "14 zile", "30 zile", "60 zile"];
const DURATE_ZILE: Record<string, number> = {
  "7 zile": 7, "14 zile": 14, "30 zile": 30, "60 zile": 60,
};

export default function PromovareAnuntPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("listing");

  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState(preselectedId || "");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [selectedDurata, setSelectedDurata] = useState("30 zile");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [payMethod, setPayMethod] = useState<"credits" | "card">("credits");
  const [showConfirm, setShowConfirm] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles").select("credits").eq("id", user.id).single();
    setCredits(profile?.credits || 0);

    const { data: lst } = await supabase
      .from("listings")
      .select("id, title, category, images, is_promoted, promotion_plan, promotion_expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setListings(lst || []);
    if (lst && lst.length > 0 && !preselectedId) {
      setSelectedListing(lst[0].id);
    }
  }

  const totalPlata = PRET_MATRICE[selectedPlan]?.[selectedDurata] || 0;
  const canPayWithCredits = credits >= totalPlata;
  const plan = PROMO_PLANS.find((p) => p.id === selectedPlan)!;
  const selectedListingData = listings.find((l) => l.id === selectedListing);

  async function handlePromovare() {
    setShowConfirm(false);
    setLoading(true);

    if (payMethod === "credits" && canPayWithCredits) {
      const days = DURATE_ZILE[selectedDurata];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const { error } = await supabase
        .from("listings")
        .update({
          is_promoted: true,
          promotion_plan: selectedPlan,
          promotion_expires_at: expiresAt.toISOString(),
        })
        .eq("id", selectedListing);

      if (!error) {
        await supabase
          .from("profiles")
          .update({ credits: credits - totalPlata })
          .eq("id", userId);

        await supabase.from("payments").insert({
          user_id: userId,
          listing_id: selectedListing,
          amount: totalPlata,
          currency: "gbp",
          type: "promotion",
          promotion_plan: selectedPlan,
          promotion_days: days,
          status: "completed",
        });

        router.push("/payments/success?type=promotion");
      } else {
        alert("A aparut o eroare. Incearca din nou.");
      }
    } else {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "promotion",
          amount: totalPlata,
          listingId: selectedListing,
          promoPlan: selectedPlan,
          promoDays: DURATE_ZILE[selectedDurata],
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Eroare la procesarea platii.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Promoveaza anunt</span>
        <div className="w-16" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* SELECTEAZA ANUNT */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Selecteaza anuntul</span>
          </div>
          <div className="p-4">
            {listings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Nu ai anunturi active de promovat.</p>
            ) : (
              <div className="relative">
                <select
                  value={selectedListing}
                  onChange={(e) => setSelectedListing(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2] appearance-none"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
            {selectedListingData?.is_promoted && (
              <div className="mt-2 bg-[#FEF3C7] border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-[#92400e]" />
                <p className="text-xs text-[#92400e]">
                  Anuntul e deja promovat cu pachetul {selectedListingData.promotion_plan} pana pe{" "}
                  {new Date(selectedListingData.promotion_expires_at).toLocaleDateString("ro-RO")}.
                  Noua promovare va suprascrie-o.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PLAN */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Alege pachetul</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {PROMO_PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={cn(
                  "flex items-center gap-3 border rounded-xl p-4 text-left transition-all",
                  selectedPlan === p.id ? "border-[#E36414] border-[1.5px] bg-[#FFF8F3]" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", p.bg)}>
                  <Rocket size={20} className={p.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                    {p.popular && <span className="text-[10px] bg-[#E36414] text-white px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {p.details.map((d) => (
                      <li key={d} className="text-xs text-gray-400 flex items-center gap-1">
                        <Check size={10} className="text-[#2D6A4F]" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto mb-1", selectedPlan === p.id ? "border-[#E36414]" : "border-gray-300")}>
                    {selectedPlan === p.id && <div className="w-2.5 h-2.5 bg-[#E36414] rounded-full" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DURATA CU PRETURI */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">
            Durata promovare
            <span className="text-xs text-gray-400 font-normal ml-2">— pretul variaza cu durata</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DURATE.map((d) => {
              const pret = PRET_MATRICE[selectedPlan]?.[d];
              const isSelected = selectedDurata === d;
              const isRecommended = d === "30 zile";
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDurata(d)}
                  className={cn(
                    "border rounded-xl p-3 text-left transition-all relative",
                    isSelected ? "border-[#E36414] bg-[#FFF8F3]" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 left-2 text-[10px] bg-[#2D6A4F] text-white px-2 py-0.5 rounded-full">
                      Recomandat
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900">{d}</p>
                  <p className={cn("text-base font-bold mt-0.5", isSelected ? "text-[#E36414]" : "text-gray-700")}>
                    £{pret?.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    £{((pret || 0) / DURATE_ZILE[d]).toFixed(2)}/zi
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* METODA PLATA */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Metoda de plata</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <button
              onClick={() => setPayMethod("credits")}
              className={cn(
                "flex items-center justify-between border rounded-xl p-3 transition-all",
                payMethod === "credits" ? "border-[#2D6A4F] bg-[#E8F4EF]" : "border-gray-100"
              )}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Din credite cont</p>
                <p className="text-xs text-gray-400">Sold: £{credits.toFixed(2)}</p>
              </div>
              {canPayWithCredits ? (
                <span className="text-xs text-[#2D6A4F] font-medium bg-[#E8F4EF] px-2 py-1 rounded-full">✓ Suficient</span>
              ) : (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">Insuficient</span>
              )}
            </button>
            <button
              onClick={() => setPayMethod("card")}
              className={cn(
                "flex items-center justify-between border rounded-xl p-3 transition-all",
                payMethod === "card" ? "border-[#2D6A4F] bg-[#E8F4EF]" : "border-gray-100"
              )}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Card bancar</p>
                <p className="text-xs text-gray-400">Visa, Mastercard prin Stripe</p>
              </div>
              <span className="text-xs text-gray-400">🔒 Sigur</span>
            </button>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Pachet {plan.name}</span>
            <span className="text-sm text-gray-500">{selectedDurata}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-1">
            <span>Total de plata</span>
            <span className="text-[#E36414] text-lg">£{totalPlata.toFixed(2)}</span>
          </div>
          {payMethod === "credits" && !canPayWithCredits && (
            <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-xs text-red-600">
                Credite insuficiente. Mai ai nevoie de £{(totalPlata - credits).toFixed(2)}.{" "}
                <Link href="/profile/credite" className="underline font-medium">Incarca cont</Link>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || !selectedListing || (payMethod === "credits" && !canPayWithCredits)}
          className="w-full bg-[#E36414] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-orange-700 transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
          {loading ? "Se proceseaza..." : `Promoveaza — £${totalPlata.toFixed(2)}`}
        </button>
      </div>

      {/* MODAL CONFIRMARE */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Confirma promovarea</h3>
            <p className="text-sm text-gray-500 mb-4">Verifica detaliile inainte de a continua:</p>

            <div className="bg-[#FAF7F2] rounded-xl p-4 mb-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Anunt</span>
                <span className="font-medium text-gray-900 truncate max-w-[180px]">
                  {selectedListingData?.title || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pachet</span>
                <span className="font-medium text-gray-900">{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Durata</span>
                <span className="font-medium text-gray-900">{selectedDurata}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plata prin</span>
                <span className="font-medium text-gray-900">
                  {payMethod === "credits" ? "Credite cont" : "Card bancar"}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-[#E36414] text-base">£{totalPlata.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600"
              >
                Anuleaza
              </button>
              <button
                onClick={handlePromovare}
                disabled={loading}
                className="flex-[2] bg-[#E36414] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Confirma si plateste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}