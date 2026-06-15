"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, CreditCard, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PACHETE = [
  { amount: 5, bonus: 0, label: "£5 credite" },
  { amount: 10, bonus: 1, label: "£10 + £1 bonus" },
  { amount: 20, bonus: 3, label: "£20 + £3 bonus", popular: true },
  { amount: 50, bonus: 10, label: "£50 + £10 bonus" },
];

export default function CreditePage() {
  const supabase = createClient();
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single() as { data: { credits: number } | null };
    setCredits(profile?.credits || 0);

    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(payments || []);
  }

  async function handleIncarca() {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 1) { alert("Suma minima este £1"); return; }
    setLoading(true);

    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "credits", amount }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
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
        <span className="text-sm font-medium text-gray-900">Credite cont</span>
        <div className="w-16" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* SOLD */}
        <div className="bg-[#2D6A4F] rounded-2xl p-5 text-white">
          <p className="text-white/70 text-xs mb-1">Sold disponibil</p>
          <p className="text-3xl font-semibold">£{credits.toFixed(2)}</p>
          <p className="text-white/60 text-xs mt-1">Foloseste creditele pentru promovare anunturi</p>
        </div>

        {/* PACHETE */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Alege suma</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {PACHETE.map((p) => (
                <button
                  key={p.amount}
                  onClick={() => { setSelectedAmount(p.amount); setCustomAmount(""); }}
                  className={cn(
                    "border rounded-xl p-3 text-left transition-all relative",
                    selectedAmount === p.amount && !customAmount ? "border-[#2D6A4F] bg-[#E8F4EF]" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-2 left-3 text-[10px] bg-[#E36414] text-white px-2 py-0.5 rounded-full">Popular</span>
                  )}
                  <p className="text-sm font-semibold text-gray-900">£{p.amount}</p>
                  {p.bonus > 0 && <p className="text-xs text-[#2D6A4F]">+ £{p.bonus} bonus</p>}
                  <p className="text-xs text-gray-400">{p.label}</p>
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Sau suma personalizata</label>
              <div className="flex gap-2">
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 flex-shrink-0">£</div>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                  placeholder="ex: 15"
                  min="1"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex justify-between text-sm font-semibold text-gray-900 mb-1">
            <span>Total de plata</span>
            <span className="text-[#E36414]">£{customAmount || selectedAmount}.00</span>
          </div>
          <p className="text-xs text-gray-400">Plata securizata prin Stripe · Visa, Mastercard</p>
        </div>

        <button
          onClick={handleIncarca}
          disabled={loading || (!selectedAmount && !customAmount)}
          className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
          {loading ? "Se proceseaza..." : "Incarca cont cu Stripe"}
        </button>

        {/* ISTORIC */}
        {history.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-900">Istoric plati</span>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-900">
                      {p.type === "credits" ? "Incarcare credite" : `Promovare ${p.promotion_plan}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">£{p.amount}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", p.status === "completed" ? "bg-[#E8F4EF] text-[#2D6A4F]" : "bg-gray-100 text-gray-500")}>
                      {p.status === "completed" ? "Platit" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}