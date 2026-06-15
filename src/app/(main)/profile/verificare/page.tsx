"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, Mail, Phone, Shield, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function VerificarePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
    setLoading(false);
  }

  async function sendVerificationEmail() {
    setSendingEmail(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resend({ type: "signup", email: user.email });
      setEmailSent(true);
    }
    setSendingEmail(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#2D6A4F]" /></div>;
  }

  const verifications = [
    {
      id: "email",
      label: "Email verificat",
      sub: "Confirma adresa de email",
      icon: Mail,
      done: profile?.email_verified,
      action: sendVerificationEmail,
      actionLabel: emailSent ? "Email trimis!" : "Trimite email verificare",
      actionLoading: sendingEmail,
    },
    {
      id: "phone",
      label: "Telefon verificat",
      sub: "Adauga si confirma numarul de telefon",
      icon: Phone,
      done: profile?.phone_verified,
      action: () => router.push("/profile/edit"),
      actionLabel: "Adauga telefon",
    },
    {
      id: "identity",
      label: "Identitate verificata",
      sub: "Incarca un document de identitate",
      icon: Shield,
      done: profile?.is_verified,
      action: null,
      actionLabel: "Contacteaza-ne",
      comingSoon: true,
    },
  ];

  const doneCount = verifications.filter((v) => v.done).length;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Verificare cont</span>
        <div className="w-16" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* PROGRESS */}
        <div className="bg-[#2D6A4F] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Nivelul de verificare</h2>
            <span className="text-white/70 text-sm">{doneCount} / {verifications.length}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(doneCount / verifications.length) * 100}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2">
            {doneCount === verifications.length
              ? "Cont complet verificat!"
              : `Mai ai ${verifications.length - doneCount} pas${verifications.length - doneCount === 1 ? "" : "i"} de verificare`}
          </p>
        </div>

        {/* VERIFICARI */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {verifications.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={v.id} className={cn("flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-b-0", v.done && "bg-[#E8F4EF]/30")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", v.done ? "bg-[#E8F4EF]" : "bg-gray-100")}>
                  <Icon size={18} className={v.done ? "text-[#2D6A4F]" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{v.label}</p>
                  <p className="text-xs text-gray-400">{v.sub}</p>
                </div>
                {v.done ? (
                  <CheckCircle size={20} className="text-[#2D6A4F] flex-shrink-0" />
                ) : v.comingSoon ? (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">In curand</span>
                ) : (
                  <button
                    onClick={v.action || undefined}
                    disabled={v.actionLoading || emailSent}
                    className="text-xs font-medium text-[#2D6A4F] bg-[#E8F4EF] px-3 py-1.5 rounded-full hover:bg-[#d4eee0] transition-colors flex-shrink-0 disabled:opacity-60"
                  >
                    {v.actionLoading ? <Loader2 size={12} className="animate-spin" /> : v.actionLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#FFF8F0] border border-[#f5d9b8] rounded-xl p-4">
          <p className="text-sm font-medium text-[#92400e] mb-1">De ce sa iti verifici contul?</p>
          <ul className="flex flex-col gap-1">
            {[
              "Conturile verificate primesc mai multa incredere",
              "Anunturile tale vor fi prioritizate in rezultate",
              "Acces la functii premium gratuit",
            ].map((tip) => (
              <li key={tip} className="text-xs text-[#7c5c3a] flex gap-2">
                <span className="text-[#E36414] flex-shrink-0">·</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}