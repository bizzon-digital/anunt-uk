"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings, MapPin, Calendar, Star, Eye, Heart,
  ShieldCheck, Home, Car, Wrench, Briefcase,
  ShoppingBag, MoreHorizontal, Plus, Edit, Trash2,
  Rocket, Copy, LogOut, Bell, Lock, HelpCircle,
  ChevronRight, Share2, Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";

const TABS = ["Anunturile mele", "Salvate", "Recenzii", "Istoric"];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activ", bg: "bg-[#E8F4EF]", text: "text-[#2D6A4F]" },
  pending: { label: "In asteptare", bg: "bg-[#FEF3C7]", text: "text-[#92400e]" },
  rejected: { label: "Respins", bg: "bg-red-50", text: "text-red-600" },
  sold: { label: "Vandut", bg: "bg-gray-100", text: "text-gray-500" },
  expired: { label: "Expirat", bg: "bg-gray-100", text: "text-gray-400" },
};

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag, diverse: MoreHorizontal,
  };
  return icons[category] || MoreHorizontal;
}

export default function ProfileClient({ profile, listings, savedListings, reviews }: {
  profile: any;
  listings: any[];
  savedListings: any[];
  reviews: any[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [localListings, setLocalListings] = useState(listings);
  const [loading, setLoading] = useState<string | null>(null);

  const totalViews = localListings.reduce((acc, l) => acc + (l.views || 0), 0);
  const activeCount = localListings.filter(l => l.status === "active").length;

  async function deleteListing(id: string) {
    if (!confirm("Esti sigur ca vrei sa stergi acest anunt?")) return;
    setLoading(id);
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) setLocalListings((prev) => prev.filter((l) => l.id !== id));
    setLoading(null);
  }

  async function prelungireAnunt(id: string) {
    setLoading(id);
    const { error } = await supabase
      .from("listings")
      .update({
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("id", id);
    if (!error) {
      setLocalListings((prev) => prev.map((l) =>
        l.id === id
          ? { ...l, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          : l
      ));
      alert("Anunt prelungit cu 30 de zile!");
    }
    setLoading(null);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function getDaysLeft(expiresAt: string) {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-8">

      {/* HEADER */}
      <div className="bg-[#2D6A4F] px-4 pt-4 pb-14 relative">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[#FAF7F2] font-medium text-base">Profilul meu</span>
          <div className="flex items-center gap-3">
            <button><Share2 size={20} className="text-[#FAF7F2]" /></button>
            <button><Settings size={20} className="text-[#FAF7F2]" /></button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#1a4f38] border-[3px] border-[#E36414] flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#FAF7F2] text-2xl font-medium">
                  {profile?.full_name?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <Link href="/profile/edit" className="absolute bottom-0 right-0 w-6 h-6 bg-[#E36414] rounded-full flex items-center justify-center border-2 border-[#2D6A4F]">
              <Edit size={12} className="text-white" />
            </Link>
          </div>
          <h1 className="text-[#FAF7F2] text-lg font-medium">{profile?.full_name || "Utilizator"}</h1>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {profile?.is_verified && (
              <span className="flex items-center gap-1 bg-white/15 text-[#FAF7F2] text-xs px-2.5 py-1 rounded-full">
                <ShieldCheck size={12} /> Verificat
              </span>
            )}
            {profile?.location && (
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin size={12} /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <Calendar size={12} /> din {new Date(profile?.created_at).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mx-4 -mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative z-10">
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {[
            { value: localListings.length, label: "Anunturi" },
            { value: profile?.rating_avg > 0 ? `${profile.rating_avg}★` : "N/A", label: "Rating", orange: true },
            { value: totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews, label: "Vizualizari" },
            { value: `${profile?.response_rate || 0}%`, label: "Raspuns" },
          ].map((stat) => (
            <div key={stat.label} className="py-4 text-center">
              <div className={cn("text-xl font-semibold", stat.orange ? "text-[#E36414]" : "text-gray-900")}>
                {stat.value}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-xl overflow-hidden flex">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition-colors border-r border-gray-100 last:border-r-0",
              activeTab === i ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {tab}
            {tab === "Anunturile mele" && localListings.length > 0 && (
              <span className="ml-1 text-[10px] opacity-70">({localListings.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mx-4 mt-3">

        {/* ANUNTURILE MELE */}
        {activeTab === 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">
                Anunturile mele ({localListings.length})
              </span>
              <Link href="/anunturi/nou" className="flex items-center gap-1 text-xs text-[#E36414] font-medium">
                <Plus size={14} /> Adauga anunt
              </Link>
            </div>

            {localListings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-3">Nu ai niciun anunt publicat</p>
                <Link href="/anunturi/nou" className="inline-flex items-center gap-1 bg-[#2D6A4F] text-white text-sm font-medium px-4 py-2 rounded-lg">
                  <Plus size={16} /> Adauga primul anunt
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {localListings.map((anunt) => {
                  const Icon = getCategoryIcon(anunt.category);
                  const statusCfg = STATUS_CONFIG[anunt.status] || STATUS_CONFIG.pending;
                  const daysLeft = anunt.expires_at ? getDaysLeft(anunt.expires_at) : null;
                  const expiringSoon = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;

                  return (
                    <div key={anunt.id} className={cn("bg-white border border-gray-100 rounded-xl flex overflow-hidden", (anunt.status === "sold" || anunt.status === "expired") && "opacity-60")}>
                      <div className="w-20 bg-[#F0EBE3] flex items-center justify-center relative flex-shrink-0">
                        {anunt.images?.[0] ? (
                          <img src={anunt.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon size={24} className="text-gray-300" />
                        )}
                        <div className={cn("absolute bottom-0 left-0 right-0 text-[9px] font-medium text-center py-0.5", statusCfg.bg, statusCfg.text)}>
                          {statusCfg.label}
                        </div>
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-0.5">{anunt.title}</p>
                        <p className="text-sm font-semibold text-[#E36414] mb-1">
                          {anunt.price ? `£${anunt.price}` : "La cerere"}
                          {anunt.price_unit && <span className="text-xs text-gray-400 font-normal ml-0.5">/ {anunt.price_unit}</span>}
                        </p>

                        {/* EXPIRARE */}
                        {anunt.expires_at && anunt.status === "active" && (
                          <div className={cn("flex items-center gap-1 mb-1.5", expiringSoon ? "text-red-500" : "text-gray-400")}>
                            <Clock size={10} />
                            <span className="text-[10px]">
                              {daysLeft !== null && daysLeft > 0
                                ? `Expira in ${daysLeft} zile`
                                : "Expirat"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Eye size={11} />
                            <span className="text-[11px]">{anunt.views || 0} viz.</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {anunt.status === "sold" || anunt.status === "expired" ? (
                              <button className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2 py-1">
                                <Copy size={11} /> Reposteaza
                              </button>
                            ) : (
                              <>
                                {anunt.status === "active" && (
  <Link
    href={`/profile/promovare?listing=${anunt.id}`}
    className={cn(
      "flex items-center gap-1 text-[11px] border rounded-lg px-2 py-1",
      anunt.is_promoted
        ? "text-[#2D6A4F] border-[#2D6A4F] bg-[#E8F4EF]"
        : "text-[#E36414] border-[#E36414]"
    )}
  >
    <Rocket size={11} />
    {anunt.is_promoted ? "Promovat ✓" : "Promoveaza"}
  </Link>
)}
                                {anunt.status === "active" && (
  <button
    onClick={async () => {
      const newValue = !anunt.auto_renew;
      setLoading(anunt.id);
      const { error } = await supabase
        .from("listings")
        .update({ auto_renew: newValue })
        .eq("id", anunt.id);
      if (!error) {
        setLocalListings((prev) => prev.map((l) =>
          l.id === anunt.id ? { ...l, auto_renew: newValue } : l
        ));
      }
      setLoading(null);
    }}
    disabled={loading === anunt.id}
    className={cn(
      "flex items-center gap-1.5 text-[11px] font-medium border rounded-lg px-2 py-1 transition-colors",
      anunt.auto_renew
        ? "bg-[#E8F4EF] text-[#2D6A4F] border-[#2D6A4F]"
        : "bg-gray-50 text-gray-400 border-gray-200"
    )}
  >
    <div className={cn(
      "w-7 h-4 rounded-full relative transition-colors flex-shrink-0",
      anunt.auto_renew ? "bg-[#2D6A4F]" : "bg-gray-300"
    )}>
      <div className={cn(
        "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all",
        anunt.auto_renew ? "left-3.5" : "left-0.5"
      )} />
    </div>
    Auto prelungire
  </button>
)}
                                <Link
                                  href={`/anunturi/${anunt.slug}`}
                                  className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2 py-1"
                                >
                                  <Eye size={11} />
                                </Link>
                                <button
                                  onClick={() => deleteListing(anunt.id)}
                                  disabled={loading === anunt.id}
                                  className="flex items-center gap-1 text-[11px] text-gray-400 border border-gray-200 rounded-lg px-2 py-1"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SALVATE */}
        {activeTab === 1 && (
          <div>
            {savedListings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">Nu ai anunturi salvate</p>
                <Link href="/anunturi" className="mt-3 inline-block text-sm text-[#2D6A4F] font-medium">
                  Exploreaza anunturi
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {savedListings.map((saved) => {
                  const anunt = saved.listings;
                  if (!anunt) return null;
                  const Icon = getCategoryIcon(anunt.category);
                  return (
                    <Link key={saved.id} href={`/anunturi/${anunt.slug}`} className="bg-white border border-gray-100 rounded-xl flex overflow-hidden hover:border-gray-200 transition-colors">
                      <div className="w-20 bg-[#F0EBE3] flex items-center justify-center flex-shrink-0">
                        {anunt.images?.[0] ? (
                          <img src={anunt.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon size={24} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-0.5">{anunt.title}</p>
                        <p className="text-sm font-semibold text-[#E36414]">
                          {anunt.price ? `£${anunt.price}` : "La cerere"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{anunt.location}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RECENZII */}
        {activeTab === 2 && (
          <div>
            {reviews.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <Star size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">Nu ai recenzii inca</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E8F4EF] flex items-center justify-center">
                          <span className="text-xs font-medium text-[#2D6A4F]">
                            {r.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.profiles?.full_name || "Utilizator"}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= r.rating ? "fill-[#E36414] text-[#E36414]" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">{timeAgo(r.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ISTORIC */}
        {activeTab === 3 && (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-gray-400">Istoricul tranzactiilor</p>
            <p className="text-xs text-gray-300 mt-1">Tranzactiile finalizate vor aparea aici</p>
          </div>
        )}
      </div>

      {/* PORTOFEL */}
      <div className="mx-4 mt-4 bg-[#2D6A4F] rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/5 rounded-full" />
        <p className="text-white/70 text-xs mb-1">Credite disponibile</p>
        <p className="text-[#FAF7F2] text-3xl font-semibold mb-4">
          £{Number(profile?.credits || 0).toFixed(2)}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Incarca cont", icon: Plus, href: "/profile/credite" },
            { label: "Promoveaza", icon: Rocket, href: "/profile/promovare" },
            { label: "Istoric plati", icon: Eye, href: "/profile/credite" },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <Link key={btn.label} href={btn.href} className="bg-white/15 border border-white/20 rounded-lg py-2 flex flex-col items-center gap-1">
                <Icon size={16} className="text-white" />
                <span className="text-[10px] text-white/80">{btn.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SETARI */}
      <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-xl overflow-hidden">
        {[
          { icon: Edit, label: "Editeaza profilul", sub: "Nume, telefon, locatie, bio", iconBg: "bg-[#E8F4EF]", iconColor: "text-[#2D6A4F]", href: "/profile/edit" },
          { icon: ShieldCheck, label: "Verificare cont", sub: "Email, telefon, ID", iconBg: "bg-[#E8F4EF]", iconColor: "text-[#2D6A4F]", href: "/profile/verificare" },
          { icon: Bell, label: "Notificari", sub: "Push, email, WhatsApp", iconBg: "bg-orange-50", iconColor: "text-[#E36414]", href: "/profile/notificari" },
          { icon: Lock, label: "Securitate & parola", sub: "Schimba parola, 2FA", iconBg: "bg-orange-50", iconColor: "text-[#E36414]", href: "/profile/securitate" },
          { icon: HelpCircle, label: "Suport & ajutor", sub: "FAQ, contacteaza-ne", iconBg: "bg-gray-100", iconColor: "text-gray-500", href: "/profile/suport" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} href={item.href} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", item.iconBg)}>
                <Icon size={16} className={item.iconColor} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          );
        })}
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
            <LogOut size={16} className="text-red-500" />
          </div>
          <span className="text-sm text-red-500 font-medium">Deconectare</span>
        </button>
      </div>

    </div>
  );
}