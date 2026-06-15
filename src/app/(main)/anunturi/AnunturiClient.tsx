"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, SlidersHorizontal, Home, Briefcase, Car, Wrench,
  ShoppingBag, Calendar, Heart, MoreHorizontal, MapPin, Clock,
  Eye, Star, ChevronDown, X, LayoutList, LayoutGrid,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import SearchClient from "./SearchClient";

const ZONE = [
  { id: "all", label: "Tot UK" },
  { id: "londra", label: "Londra" },
  { id: "birmingham", label: "Birmingham" },
  { id: "manchester", label: "Manchester" },
  { id: "leeds", label: "Leeds" },
  { id: "sheffield", label: "Sheffield" },
  { id: "liverpool", label: "Liverpool" },
  { id: "bristol", label: "Bristol" },
  { id: "leicester", label: "Leicester" },
  { id: "slough", label: "Slough" },
  { id: "coventry", label: "Coventry" },
  { id: "luton", label: "Luton" },
  { id: "nottingham", label: "Nottingham" },
  { id: "newcastle", label: "Newcastle" },
  { id: "bradford", label: "Bradford" },
  { id: "cardiff", label: "Cardiff" },
  { id: "edinburgh", label: "Edinburgh" },
  { id: "glasgow", label: "Glasgow" },
  { id: "reading", label: "Reading" },
  { id: "milton-keynes", label: "Milton Keynes" },
  { id: "northampton", label: "Northampton" },
  { id: "derby", label: "Derby" },
  { id: "southampton", label: "Southampton" },
  { id: "oxford", label: "Oxford" },
  { id: "cambridge", label: "Cambridge" },
];

const CATEGORII = [
  { id: "all", label: "Toate", icon: MoreHorizontal, color: "text-gray-500", bg: "bg-gray-100" },
  { id: "chirie", label: "Chirie", icon: Home, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "joburi", label: "Joburi", icon: Briefcase, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "masini", label: "Masini", icon: Car, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "servicii", label: "Servicii", icon: Wrench, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "vand-cumpar", label: "Vand/Cumpar", icon: ShoppingBag, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "evenimente", label: "Evenimente", icon: Calendar, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "matrimoniale", label: "Matrimoniale", icon: Heart, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "diverse", label: "Diverse", icon: MoreHorizontal, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
];

const SORTARE = [
  { id: "recente", label: "Cele mai recente" },
  { id: "pret-asc", label: "Pret crescator" },
  { id: "pret-desc", label: "Pret descrescator" },
  { id: "vizualizari", label: "Cele mai vizualizate" },
];

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag, evenimente: Calendar,
    matrimoniale: Heart, diverse: MoreHorizontal,
  };
  return icons[category] || MoreHorizontal;
}

function getCategoryColor(category: string) {
  return ["chirie", "joburi", "servicii", "masini"].includes(category)
    ? "text-[#2D6A4F]" : "text-[#E36414]";
}

export default function AnunturiClient({
  initialListings,
  totalCount,
  initialFilters,
  totalListings,
  totalUsers,
}: {
  initialListings: any[];
  totalCount: number;
  initialFilters: { q: string; categorie: string; zona: string; page: number };
  totalListings: number;
  totalUsers: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categorieActiva, setCategorieActiva] = useState(initialFilters.categorie);
  const [zonaActiva, setZonaActiva] = useState(initialFilters.zona);
  const [sortare, setSortare] = useState("recente");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.q);
  const [pretMin, setPretMin] = useState("");
  const [pretMax, setPretMax] = useState("");

  const currentPage = initialFilters.page;
  const totalPages = Math.ceil(totalCount / 12);

  useEffect(() => {
    setCategorieActiva(searchParams.get("categorie") || "all");
    setZonaActiva(searchParams.get("zona") || "all");
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  function buildUrl(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    const cat = overrides.categorie ?? categorieActiva;
    const zona = overrides.zona ?? zonaActiva;
    const q = overrides.q ?? searchQuery;
    const page = overrides.page ?? "1";
    if (cat !== "all") params.set("categorie", cat);
    if (zona !== "all") params.set("zona", zona);
    if (q) params.set("q", q);
    if (page !== "1") params.set("page", page);
    return `/anunturi${params.toString() ? "?" + params.toString() : ""}`;
  }

  function applyFilters(overrides: Record<string, string> = {}) {
    router.push(buildUrl(overrides));
  }

  function stergeFiltre() {
    setCategorieActiva("all");
    setZonaActiva("all");
    setSearchQuery("");
    setPretMin("");
    setPretMax("");
    router.push("/anunturi");
  }

  const hasActiveFilters = categorieActiva !== "all" || zonaActiva !== "all" || searchQuery;

  return (
    <div>
      {/* SEARCH BAR */}
<div className="bg-[#2D6A4F] px-4 py-3">
  <div className="max-w-6xl mx-auto">
    <div className="bg-white rounded-xl flex items-center px-3 py-2.5 gap-2">
      <SearchClient initialQuery={initialFilters.q} />
      <button
        onClick={() => setShowFilterDrawer(true)}
        className="flex items-center gap-1.5 text-[#2D6A4F] text-sm font-medium border-l border-gray-200 pl-3 lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filtre
      </button>
    </div>
  </div>
</div>

      <div className="max-w-6xl mx-auto px-4 py-4">
{/* CATEGORII CU ICONURI — vizibile pe toate dispozitivele deasupra listei */}
<div className="mb-4">
  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
    {CATEGORII.map((cat) => {
      const Icon = cat.icon;
      const isActive = categorieActiva === cat.id;
      return (
        <button
          key={cat.id}
          onClick={() => { setCategorieActiva(cat.id); applyFilters({ categorie: cat.id }); }}
          className={cn(
            "flex flex-col items-center gap-1.5 bg-white border rounded-xl py-3 px-1 transition-all",
            isActive
              ? "border-[#2D6A4F] bg-[#E8F4EF] shadow-sm"
              : "border-gray-100 hover:border-[#2D6A4F] hover:shadow-sm"
          )}
        >
          <div className={cn("p-2 rounded-xl", cat.bg)}>
            <Icon size={20} className={cat.color} />
          </div>
          <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">
            {cat.label}
          </span>
        </button>
      );
    })}
  </div>
</div>
        

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* SIDEBAR STANGA - doar desktop */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* CATEGORII */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Categorii</span>
              </div>
              <div className="p-2">
                {CATEGORII.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = categorieActiva === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setCategorieActiva(cat.id); applyFilters({ categorie: cat.id }); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        isActive ? "bg-[#E8F4EF] text-[#2D6A4F]" : "hover:bg-gray-50 text-gray-600"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cat.bg)}>
                        <Icon size={16} className={cat.color} />
                      </div>
                      <span className={cn("text-sm font-medium", isActive ? "text-[#2D6A4F]" : "text-gray-700")}>
                        {cat.label}
                      </span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#2D6A4F] rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZONE */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Zona / Oras</span>
              </div>
              <div className="p-3 flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                {ZONE.map((zona) => (
                  <button
                    key={zona.id}
                    onClick={() => { setZonaActiva(zona.id); applyFilters({ zona: zona.id }); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors text-sm",
                      zonaActiva === zona.id ? "bg-[#E8F4EF] text-[#2D6A4F] font-medium" : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    <MapPin size={12} className={zonaActiva === zona.id ? "text-[#2D6A4F]" : "text-[#E36414]"} />
                    {zona.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PRET */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Pret (£)</span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <input
                  type="number"
                  placeholder="Minim"
                  value={pretMin}
                  onChange={(e) => setPretMin(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]"
                />
                <input
                  type="number"
                  placeholder="Maxim"
                  value={pretMax}
                  onChange={(e) => setPretMax(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]"
                />
                <button
                  onClick={() => applyFilters()}
                  className="w-full bg-[#2D6A4F] text-white rounded-lg py-2 text-sm font-medium"
                >
                  Aplica
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#2D6A4F] rounded-xl p-4 text-white">
              <h3 className="font-medium text-sm mb-1">Ai ceva de oferit?</h3>
              <p className="text-white/70 text-xs mb-3">Posteaza gratuit pe Anunturi.uk</p>
              <Link
                href="/anunturi/nou"
                className="w-full bg-[#E36414] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                + Adauga anunt
              </Link>
            </div>
          </div>

          {/* CONTINUT PRINCIPAL */}
          <div className="lg:col-span-3">

            {/* FILTRE ACTIVE */}
            {hasActiveFilters && (
              <div className="flex gap-2 flex-wrap mb-3">
                {categorieActiva !== "all" && (
                  <span className="flex items-center gap-1 bg-[#E8F4EF] text-[#2D6A4F] text-xs font-medium px-2.5 py-1 rounded-full border border-[#a8d5bc]">
                    {CATEGORII.find(c => c.id === categorieActiva)?.label}
                    <button onClick={() => { setCategorieActiva("all"); applyFilters({ categorie: "all" }); }}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {zonaActiva !== "all" && (
                  <span className="flex items-center gap-1 bg-[#E8F4EF] text-[#2D6A4F] text-xs font-medium px-2.5 py-1 rounded-full border border-[#a8d5bc]">
                    {ZONE.find(z => z.id === zonaActiva)?.label}
                    <button onClick={() => { setZonaActiva("all"); applyFilters({ zona: "all" }); }}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-[#E8F4EF] text-[#2D6A4F] text-xs font-medium px-2.5 py-1 rounded-full border border-[#a8d5bc]">
                    "{searchQuery}"
                    <button onClick={() => { setSearchQuery(""); applyFilters({ q: "" }); }}>
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button onClick={stergeFiltre} className="text-xs text-[#E36414] font-medium px-2 py-1">
                  Sterge tot
                </button>
              </div>
            )}

            {/* REZULTATE + SORTARE */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{totalCount}</span> anunturi
                {categorieActiva !== "all" && <span className="text-gray-400"> in {CATEGORII.find(c => c.id === categorieActiva)?.label}</span>}
                {zonaActiva !== "all" && <span className="text-gray-400"> in {ZONE.find(z => z.id === zonaActiva)?.label}</span>}
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    {SORTARE.find(s => s.id === sortare)?.label}
                    <ChevronDown size={14} />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                      {SORTARE.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSortare(s.id); setShowSortDropdown(false); }}
                          className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50", sortare === s.id ? "text-[#2D6A4F] font-medium bg-[#E8F4EF]" : "text-gray-600")}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode("list")} className={cn("p-1.5 transition-colors", viewMode === "list" ? "bg-[#2D6A4F] text-white" : "bg-white text-gray-400")}>
                    <LayoutList size={16} />
                  </button>
                  <button onClick={() => setViewMode("grid")} className={cn("p-1.5 transition-colors", viewMode === "grid" ? "bg-[#2D6A4F] text-white" : "bg-white text-gray-400")}>
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* LISTA ANUNTURI */}
            {initialListings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                <Search size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">Niciun anunt gasit</p>
                <p className="text-gray-400 text-sm mb-4">Incearca alte filtre sau cauta altceva</p>
                <button onClick={stergeFiltre} className="text-sm text-[#2D6A4F] font-medium">Sterge filtrele</button>
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-3">
                {initialListings.map((anunt) => {
                  const Icon = getCategoryIcon(anunt.category);
                  const categoryColor = getCategoryColor(anunt.category);
                  return (
                    <Link
                      key={anunt.id}
                      href={`/anunturi/${anunt.slug}`}
                      className={cn(
                        "bg-white border rounded-xl overflow-hidden flex hover:shadow-md transition-all group",
                        anunt.is_promoted ? "border-[#E36414] border-[1.5px]" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="w-32 sm:w-40 min-h-[110px] bg-[#F0EBE3] flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                        {anunt.images?.[0] ? (
                          <img src={anunt.images[0]} alt={anunt.title} className="w-full h-full object-cover" />
                        ) : (
                          <Icon size={32} className="text-gray-300" />
                        )}
                        {anunt.is_promoted && (
                          <div className="absolute top-0 left-0 right-0 bg-[#E36414] text-white text-[9px] font-medium text-center py-0.5 flex items-center justify-center gap-1">
                            ⭐ Promovat
                          </div>
                        )}
                        {anunt.images?.length > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">{anunt.images.length} foto</div>
                        )}
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-0.5", categoryColor)}>{anunt.category}</p>
                        <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-[#2D6A4F] transition-colors">{anunt.title}</p>
                        <p className="text-base font-semibold text-[#E36414] mb-1.5">
                          {anunt.price ? (
                            <>£{anunt.price}{anunt.price_unit && <span className="text-xs text-gray-400 font-normal ml-0.5">/ {anunt.price_unit}</span>}</>
                          ) : (
                            <span className="text-sm text-gray-400 font-normal">La cerere</span>
                          )}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-400"><MapPin size={11} /><span className="text-[11px] truncate">{anunt.location}</span></div>
                          <div className="flex items-center gap-1 text-gray-300"><Clock size={11} /><span className="text-[11px]">{timeAgo(anunt.created_at)}</span></div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          {anunt.profiles?.rating_avg > 0 && (
                            <div className="flex items-center gap-0.5"><Star size={11} className="text-[#E36414] fill-[#E36414]" /><span className="text-[11px] text-gray-500">{anunt.profiles.rating_avg}</span></div>
                          )}
                          {anunt.profiles?.is_verified && (
                            <span className="text-[10px] text-[#2D6A4F] font-medium bg-[#E8F4EF] px-1.5 py-0.5 rounded">Verificat</span>
                          )}
                          <div className="flex items-center gap-0.5 ml-auto"><Eye size={11} className="text-gray-300" /><span className="text-[11px] text-gray-300">{anunt.views}</span></div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {initialListings.map((anunt) => {
                  const Icon = getCategoryIcon(anunt.category);
                  const categoryColor = getCategoryColor(anunt.category);
                  return (
                    <Link
                      key={anunt.id}
                      href={`/anunturi/${anunt.slug}`}
                      className={cn(
                        "bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col",
                        anunt.is_promoted ? "border-[#E36414] border-[1.5px]" : "border-gray-100"
                      )}
                    >
                      <div className="h-40 bg-[#F0EBE3] flex items-center justify-center relative overflow-hidden">
                        {anunt.images?.[0] ? (
                          <img src={anunt.images[0]} alt={anunt.title} className="w-full h-full object-cover" />
                        ) : (
                          <Icon size={40} className="text-gray-300" />
                        )}
                        {anunt.is_promoted && (
                          <div className="absolute top-0 left-0 right-0 bg-[#E36414] text-white text-[9px] font-medium text-center py-0.5">⭐ Promovat</div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-0.5", categoryColor)}>{anunt.category}</p>
                        <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 mb-1.5 flex-1">{anunt.title}</p>
                        <p className="text-base font-semibold text-[#E36414] mb-1">
                          {anunt.price ? <>£{anunt.price}</> : <span className="text-sm text-gray-400 font-normal">La cerere</span>}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 mb-1"><MapPin size={11} /><span className="text-[11px] truncate">{anunt.location}</span></div>
                        <div className="flex items-center justify-between">
                          {anunt.profiles?.is_verified && <span className="text-[10px] text-[#2D6A4F] font-medium bg-[#E8F4EF] px-1.5 py-0.5 rounded">Verificat</span>}
                          <div className="flex items-center gap-0.5 ml-auto"><Clock size={10} className="text-gray-300" /><span className="text-[10px] text-gray-300">{timeAgo(anunt.created_at)}</span></div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* PAGINARE */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => applyFilters({ page: String(currentPage - 1) })} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-400 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => applyFilters({ page: String(p) })} className={cn("w-9 h-9 flex items-center justify-center border rounded-lg text-sm font-medium", currentPage === p ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => applyFilters({ page: String(currentPage + 1) })} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-400 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER DRAWER MOBILE */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterDrawer(false)} />
          <div className="relative bg-white w-full sm:w-96 sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Filtreaza anunturi</h3>
              <button onClick={() => setShowFilterDrawer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Categorie</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORII.map(cat => (
                    <button key={cat.id} onClick={() => setCategorieActiva(cat.id)} className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", categorieActiva === cat.id ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Zona</p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {ZONE.map(zona => (
                    <button key={zona.id} onClick={() => setZonaActiva(zona.id)} className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", zonaActiva === zona.id ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}>
                      {zona.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pret (£)</p>
                <div className="flex gap-3 items-center">
                  <input type="number" placeholder="Min" value={pretMin} onChange={e => setPretMin(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]" />
                  <span className="text-gray-400">—</span>
                  <input type="number" placeholder="Max" value={pretMax} onChange={e => setPretMax(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2D6A4F]" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => { stergeFiltre(); setShowFilterDrawer(false); }} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600">Reseteaza</button>
              <button onClick={() => { applyFilters(); setShowFilterDrawer(false); }} className="flex-[2] bg-[#2D6A4F] text-white rounded-xl py-3 text-sm font-medium">Aplica</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}