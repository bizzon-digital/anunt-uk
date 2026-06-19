﻿"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Share2, Heart, MapPin, Clock, Eye, Star,
  Shield, ShieldCheck, Phone, MessageCircle, Flag,
  ChevronLeft, ChevronRight, Home, Car, Wrench,
  Briefcase, ShoppingBag, MoreHorizontal, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag, diverse: MoreHorizontal,
  };
  return icons[category] || MoreHorizontal;
}

export default function AnuntPage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();
  const router = useRouter();
  const [anunt, setAnunt] = useState<any>(null);
  const [alteAnunturi, setAlteAnunturi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchAnunt();
  }, [slug]);

  async function fetchAnunt() {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*, profiles(id, full_name, avatar_url, rating_avg, rating_count, is_verified, response_rate, created_at, location)")
      .eq("slug", slug)
      .single();

    if (data) {
      setAnunt(data);
      await supabase.from("listings").update({ views: (data.views || 0) + 1 }).eq("id", data.id);

      const { data: alte } = await supabase
        .from("listings")
        .select("id, title, price, price_unit, category, slug, images, location, description, contact_methods, phone, whatsapp, price_type, bills_included, user_id, views, created_at, listing_id, is_promoted")
        .eq("user_id", data.user_id)
        .eq("status", "active")
        .neq("id", data.id)
        .limit(4);

      setAlteAnunturi(alte || []);
    }
    setLoading(false);
  }

  async function handleReport() {
    if (!reportReason) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("reports").insert({
      reporter_id: user.id,
      listing_id: anunt.id,
      reason: reportReason,
    });
    setShowReport(false);
    alert("Raportul a fost trimis. Multumim!");
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (saved) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", anunt.id);
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: anunt.id });
    }
    setSaved(!saved);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Se incarca...</p>
      </div>
    );
  }

  if (!anunt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 font-medium mb-2">Anuntul nu a fost gasit</p>
        <Link href="/anunturi" className="text-[#2D6A4F] text-sm">Inapoi la anunturi</Link>
      </div>
    );
  }

  const Icon = getCategoryIcon(anunt.category);
  const images = anunt.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* TOPBAR mobil */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 lg:hidden">
        <Link href="/anunturi" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleSave}>
            <Heart size={22} className={saved ? "fill-red-500 text-red-500" : "text-gray-400"} />
          </button>
          <button><Share2 size={22} className="text-gray-400" /></button>
        </div>
      </div>

      {/* Breadcrumb desktop */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
        <Link href="/" className="hover:text-[#2D6A4F]">Acasa</Link>
        <span>/</span>
        <Link href="/anunturi" className="hover:text-[#2D6A4F]">Anunturi</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{anunt.title}</span>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:px-4 lg:pb-8">
        {/* STANGA */}
        <div className="lg:col-span-2">
          {/* GALERIE */}
          <div className="relative bg-[#F0EBE3] aspect-[4/3] lg:rounded-xl overflow-hidden">
            {hasImages ? (
              <img
                src={images[currentImage]}
                alt={anunt.title}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowLightbox(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon size={64} className="text-gray-300" />
              </div>
            )}

            {anunt.is_promoted && (
              <div className="absolute top-3 left-0 bg-[#E36414] text-white text-xs font-medium px-3 py-1 rounded-r-lg flex items-center gap-1.5">
                <Star size={12} className="fill-white" /> Anunt promovat
              </div>
            )}

            {hasImages && images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentImage(Math.min(images.length - 1, currentImage + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={cn("w-1.5 h-1.5 rounded-full", i === currentImage ? "bg-white" : "bg-white/40")}
                    />
                  ))}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* DETALII */}
          <div className="px-4 pt-4 lg:px-0">
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs font-medium bg-[#E8F4EF] text-[#2D6A4F] px-2.5 py-1 rounded-full">{anunt.category}</span>
              {(anunt.location || anunt.postcode) && (
  <span className="text-xs font-medium bg-[#F0EBE3] text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1">
    <MapPin size={11} /> {anunt.location || anunt.postcode}
  </span>
)}
              {anunt.bills_included && (
                <span className="text-xs font-medium bg-[#FFF0E6] text-[#E36414] px-2.5 py-1 rounded-full">Bills incluse</span>
              )}
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{anunt.title}</h1>
            <div className="text-2xl font-bold text-[#E36414] mb-3">
              {anunt.price ? (
                <>Ã‚GBP {anunt.price}<span className="text-sm text-gray-400 font-normal ml-1">/ {anunt.price_unit}</span></>
              ) : (
                <span className="text-lg text-gray-500 font-normal">La cerere</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1"><Clock size={13} /> Postat {timeAgo(anunt.created_at)}</div>
              <div className="flex items-center gap-1"><Eye size={13} /> {anunt.views} vizualizari</div>
              <div className="flex items-center gap-1"><Heart size={13} /> {anunt.saves} salvari</div>
              <span className="ml-auto text-gray-300">#{anunt.listing_id}</span>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Descriere</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{anunt.description}</div>
            </div>

            {/* CONTACT mobil */}
            <div className="lg:hidden mb-4 pb-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Contacteaza vanzatorul</h2>
              <div className="flex flex-col gap-2">
                {anunt.contact_methods?.includes("whatsapp") && anunt.whatsapp && (
                  <a href={`https://wa.me/${anunt.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    <MessageCircle size={20} /> Contacteaza pe WhatsApp
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {anunt.contact_methods?.includes("phone") && anunt.phone && (
                    <button onClick={() => setShowPhone(!showPhone)} className="border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                      <Phone size={18} /> {showPhone ? anunt.phone : "Suna acum"}
                    </button>
                  )}
                  {anunt.contact_methods?.includes("message") && (
  <button
    onClick={async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      if (user.id === anunt.user_id) { router.push("/messages"); return; }

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", anunt.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", anunt.user_id)
        .maybeSingle();

      if (existing) {
        router.push("/messages");
        return;
      }

      await supabase.from("conversations").insert({
        listing_id: anunt.id,
        buyer_id: user.id,
        seller_id: anunt.user_id,
        last_message: "Conversatie noua",
        last_message_at: new Date().toISOString(),
      });

      router.push("/messages");
    }}
    className="border border-[#2D6A4F] text-[#2D6A4F] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#E8F4EF] transition-colors"
  >
    <MessageCircle size={18} /> Mesaj intern
  </button>
)}
                </div>
                <button onClick={handleSave} className="border border-gray-200 text-gray-500 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <Heart size={18} className={saved ? "fill-red-500 text-red-500" : ""} />
                  {saved ? "Salvat" : "Salveaza anuntul"}
                </button>
              </div>
            </div>

            {/* Safety */}
            <div className="bg-[#FFF8F0] border border-[#f5d9b8] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-[#E36414]" />
                <span className="text-sm font-semibold text-[#92400e]">Sfaturi de siguranta</span>
              </div>
              <ul className="flex flex-col gap-1">
                {["Intalneste-te intr-un loc public", "Nu trimite bani in avans", "Verifica identitatea proprietarului", "Citeste contractul cu atentie"].map((tip) => (
                  <li key={tip} className="text-xs text-[#7c5c3a] flex gap-2">
                    <span className="text-[#E36414] flex-shrink-0">Ã‚-</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center mb-6">
              <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                <Flag size={14} /> Raporteaza acest anunt
              </button>
            </div>
          </div>
        </div>

        {/* DREAPTA desktop */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-20">
            <div className="text-2xl font-bold text-[#E36414] mb-1">
              {anunt.price ? <>Ã‚GBP {anunt.price}<span className="text-sm text-gray-400 font-normal ml-1">/ {anunt.price_unit}</span></> : <span className="text-lg text-gray-500 font-normal">La cerere</span>}
            </div>
            <p className="text-xs text-gray-400 mb-4">{anunt.price_type === "negociabil" ? "Pret negociabil" : "Pret fix"}{anunt.bills_included ? " Ã‚- Bills incluse" : ""}</p>
            <div className="flex flex-col gap-2">
              {anunt.contact_methods?.includes("whatsapp") && anunt.whatsapp && (
                <a href={`https://wa.me/${anunt.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                  <MessageCircle size={20} /> WhatsApp
                </a>
              )}
              <div className="grid grid-cols-2 gap-2">
                {anunt.contact_methods?.includes("phone") && anunt.phone && (
                  <button onClick={() => setShowPhone(!showPhone)} className="border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                    <Phone size={16} /> {showPhone ? anunt.phone : "Telefon"}
                  </button>
                )}
                {anunt.contact_methods?.includes("message") && (
  <button
    onClick={async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      if (user.id === anunt.user_id) { router.push("/messages"); return; }

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", anunt.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", anunt.user_id)
        .maybeSingle();

      if (existing) {
        router.push("/messages");
        return;
      }

      await supabase.from("conversations").insert({
        listing_id: anunt.id,
        buyer_id: user.id,
        seller_id: anunt.user_id,
        last_message: "Conversatie noua",
        last_message_at: new Date().toISOString(),
      });

      router.push("/messages");
    }}
    className="border border-[#2D6A4F] text-[#2D6A4F] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E8F4EF] transition-colors"
  >
    <MessageCircle size={16} /> Mesaj
  </button>
)}
              </div>
              <button onClick={handleSave} className="border border-gray-200 text-gray-500 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                <Heart size={16} className={saved ? "fill-red-500 text-red-500" : ""} />
                {saved ? "Salvat" : "Salveaza"}
              </button>
            </div>
          </div>
{/* LOCALITATE + HARTA */}
{anunt.location && (
  <div className="bg-white border border-gray-100 rounded-xl p-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Localitate</p>
    <div className="flex items-center gap-2 mb-3">
      <MapPin size={16} className="text-[#E36414]" />
      <span className="text-sm font-medium text-gray-900">{anunt.location}</span>
    </div>
    <div className="rounded-lg overflow-hidden h-32">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(anunt.location + ", UK")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
      />
    </div>
  </div>
)}
          {/* User card */}
          {anunt.profiles && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 border-2 border-[#E36414] overflow-hidden">
                  {anunt.profiles.avatar_url ? (
                    <img src={anunt.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-medium text-lg">{anunt.profiles.full_name?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm">{anunt.profiles.full_name?.split(" ")[0]}</span>
                  <div className="flex gap-1.5 mt-1">
                    {anunt.profiles.is_verified && (
                      <span className="text-[10px] bg-[#E8F4EF] text-[#2D6A4F] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <ShieldCheck size={10} /> Verificat
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {anunt.profiles.rating_avg > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xl font-bold text-gray-900">{anunt.profiles.rating_avg}</div>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} className={s <= Math.round(anunt.profiles.rating_avg) ? "fill-[#E36414] text-[#E36414]" : "text-gray-200"} />
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-400">{anunt.profiles.rating_count} recenzii</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#FAF7F2] rounded-lg py-2 text-center">
                  <div className="text-sm font-semibold text-gray-900">{anunt.profiles.response_rate || 0}%</div>
                  <div className="text-[10px] text-gray-400">Raspuns</div>
                </div>
                <div className="bg-[#FAF7F2] rounded-lg py-2 text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(anunt.profiles.created_at).toLocaleDateString("ro-RO", { month: "short", year: "numeric" })}
                  </div>
                  <div className="text-[10px] text-gray-400">Pe site</div>
                </div>
              </div>

              {alteAnunturi.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Alte anunturi
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {alteAnunturi.map((a) => {
                      const AltIcon = getCategoryIcon(a.category);
                      return (
                        <Link key={a.id} href={`/anunturi/${a.slug}`} className="flex-shrink-0 w-28 bg-[#FAF7F2] border border-gray-100 rounded-lg overflow-hidden">
                          <div className="h-16 bg-[#e8e2d9] flex items-center justify-center overflow-hidden">
                            {a.images?.[0] ? (
                              <img src={a.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <AltIcon size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="p-1.5">
                            <p className="text-[10px] font-medium text-gray-700 leading-tight truncate">{a.title}</p>
                            <p className="text-[10px] text-[#E36414] font-semibold mt-0.5">{a.price ? `Ã‚GBP ${a.price}` : "La cerere"}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
{/* LOCALITATE + HARTA mobil */}
{anunt.location && (
  <div className="lg:hidden px-4 pb-4">
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Localitate</p>
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className="text-[#E36414]" />
        <span className="text-sm font-medium text-gray-900">{anunt.location}</span>
      </div>
      <div className="rounded-lg overflow-hidden h-32">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(anunt.location + ", UK")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        />
      </div>
    </div>
  </div>
)}
      {/* USER CARD mobil */}
      {anunt.profiles && (
        <div className="lg:hidden px-4 pb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 border-2 border-[#E36414] overflow-hidden">
                {anunt.profiles.avatar_url ? (
                  <img src={anunt.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-medium text-lg">{anunt.profiles.full_name?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
              <div>
                <Link href={`/utilizator/${anunt.profiles.id}`} className="font-semibold text-gray-900 text-sm hover:text-[#2D6A4F] transition-colors">
  {anunt.profiles.full_name?.split(" ")[0]}
</Link>
                {anunt.profiles.is_verified && (
                  <div className="mt-1">
                    <span className="text-[10px] bg-[#E8F4EF] text-[#2D6A4F] px-2 py-0.5 rounded font-medium">Verificat</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {showLightbox && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowLightbox(false)}
        >
          <button
            style={{ position: 'absolute', top: '16px', right: '16px', color: 'white', zIndex: 10000, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); setShowLightbox(false); }}
          >
            <X size={28} />
          </button>
          <img
            src={images[currentImage]}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '85vh', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* MODAL REPORT */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReport(false)} />
          <div className="relative bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Raporteaza anuntul</h3>
              <button onClick={() => setShowReport(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {["Informatii false", "Pret incorect", "Anunt duplicat", "Continut inadecvat", "Posibila frauda", "Altele"].map((reason) => (
                <button key={reason} onClick={() => setReportReason(reason)} className={cn("text-left px-4 py-2.5 rounded-lg border text-sm transition-colors", reportReason === reason ? "border-[#2D6A4F] bg-[#E8F4EF] text-[#2D6A4F]" : "border-gray-100 hover:bg-gray-50 text-gray-600")}>
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReport(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600">Anuleaza</button>
              <button onClick={handleReport} disabled={!reportReason} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">Trimite raportul</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

