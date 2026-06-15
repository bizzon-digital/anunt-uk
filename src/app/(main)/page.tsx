import Link from "next/link";
import {
  Home, Briefcase, Car, Wrench, ShoppingBag,
  Calendar, Heart, MoreHorizontal, MapPin, Clock,
  Eye, Star, ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn, timeAgo } from "@/lib/utils";
import HomeClient from "./HomeClient";

const CATEGORII = [
  { id: "chirie", label: "Chirie", icon: Home, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "joburi", label: "Joburi", icon: Briefcase, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "servicii", label: "Servicii", icon: Wrench, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "masini", label: "Masini", icon: Car, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "vand-cumpar", label: "Vand / Cumpar", icon: ShoppingBag, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "evenimente", label: "Evenimente", icon: Calendar, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "matrimoniale", label: "Matrimoniale", icon: Heart, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "diverse", label: "Diverse", icon: MoreHorizontal, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
];

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

function getCategoryColor(category: string) {
  return ["chirie", "joburi", "servicii", "masini"].includes(category)
    ? "text-[#2D6A4F]" : "text-[#E36414]";
}

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag, evenimente: Calendar,
    matrimoniale: Heart, diverse: MoreHorizontal,
  };
  return icons[category] || MoreHorizontal;
}

export default async function HomePage() {
  const supabase = createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(id, full_name, avatar_url, rating_avg, is_verified)")
    .eq("status", "active")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const categoryCountPromises = CATEGORII.map(async (cat) => {
    const { count } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("category", cat.id);
    return { ...cat, count: count || 0 };
  });
  const categoriiCuCount = await Promise.all(categoryCountPromises);

  return (
    <div>
      <div className="bg-[#2D6A4F]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-5">
            <h1 className="text-white font-serif text-2xl md:text-3xl font-medium text-center mb-2">
              Anunturi pentru romanii din UK
            </h1>
            <p className="text-white/60 text-sm text-center mb-5">
              Chirie, joburi, masini, servicii si multe altele
            </p>
            <HomeClient />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-start md:justify-center pb-1">
            {ZONE.slice(0, 12).map((zona) => (
              <Link
                key={zona.id}
                href={zona.id === "all" ? "/anunturi" : `/anunturi?zona=${zona.id}`}
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors bg-transparent text-white/80 border-white/30 hover:border-white/60 hover:text-white"
              >
                {zona.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-8 flex-wrap">
          {[
            { label: "Anunturi active", value: (totalListings || 0).toLocaleString() },
            { label: "Utilizatori", value: (totalUsers || 0).toLocaleString() },
            { label: "Orase", value: String(ZONE.length - 1) },
            { label: "Categorii", value: "8" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-semibold text-[#2D6A4F]">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Categorii</h2>
            <Link href="/anunturi" className="text-xs text-[#2D6A4F] font-medium flex items-center gap-0.5">
              Toate <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categoriiCuCount.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/anunturi?categorie=${cat.id}`}
                  className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl py-4 px-2 hover:border-[#2D6A4F] hover:shadow-sm transition-all"
                >
                  <div className={cn("p-2.5 rounded-xl", cat.bg)}>
                    <Icon size={22} className={cat.color} />
                  </div>
                  <span className="text-[11px] text-gray-600 text-center leading-tight font-medium">
                    {cat.label}
                  </span>
                  {cat.count > 0 && (
                    <span className="text-[10px] text-gray-400">{cat.count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Anunturi recente</h2>
              <Link href="/anunturi" className="text-xs text-[#2D6A4F] font-medium flex items-center gap-0.5">
                Vezi toate <ChevronRight size={14} />
              </Link>
            </div>

            {!listings || listings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">Nu exista anunturi active momentan.</p>
                <Link href="/anunturi/nou" className="text-sm text-[#2D6A4F] font-medium">
                  Fii primul care adauga un anunt →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const items: React.ReactNode[] = [];
                  let gridPos = 0;

                  listings.forEach((anunt, index) => {
                    const Icon = getCategoryIcon(anunt.category);
                    const categoryColor = getCategoryColor(anunt.category);

                    if (anunt.is_promoted) {
                      items.push(
                        <Link
                          key={anunt.id}
                          href={`/anunturi/${anunt.slug}`}
                          className="bg-white border-[1.5px] border-[#E36414] rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                        >
                          <div className="relative h-40 bg-[#F0EBE3] flex items-center justify-center overflow-hidden">
                            {anunt.images?.[0] ? (
                              <img src={anunt.images[0]} alt={anunt.title} className="w-full h-full object-cover" />
                            ) : (
                              <Icon size={40} className="text-gray-300" />
                            )}
                            <div className="absolute top-0 left-0 right-0 bg-[#E36414] text-white text-[10px] font-medium text-center py-1 flex items-center justify-center gap-1">
                              ⭐ Anunt promovat
                            </div>
                            {anunt.images?.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                                {anunt.images.length} foto
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-1", categoryColor)}>
                              {anunt.category}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-[#2D6A4F] transition-colors flex-1">
                              {anunt.title}
                            </p>
                            <p className="text-base font-bold text-[#E36414] mb-2">
                              {anunt.price ? (
                                <>£{anunt.price}{anunt.price_unit && <span className="text-xs text-gray-400 font-normal ml-0.5">/{anunt.price_unit}</span>}</>
                              ) : (
                                <span className="text-sm text-gray-400 font-normal">La cerere</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-gray-400">
                              <MapPin size={11} />
                              <span className="text-[11px] truncate">{anunt.location}</span>
                              <Clock size={11} className="ml-auto flex-shrink-0" />
                              <span className="text-[11px]">{timeAgo(anunt.created_at)}</span>
                            </div>
                          </div>
                        </Link>
                      );
                      gridPos++;

                      const nextAnunt = listings[index + 1];
                      if (gridPos % 2 !== 0 && (!nextAnunt || !nextAnunt.is_promoted)) {
                        items.push(
                          <Link
                            key={`cta-${index}`}
                            href="/profile/promovare"
                            className="bg-gradient-to-br from-[#E8F4EF] to-[#FFF8F0] border-2 border-dashed border-[#2D6A4F]/40 rounded-xl hover:border-[#2D6A4F] hover:shadow-md transition-all flex flex-col items-center justify-center p-5 text-center"
                          >
                            <div className="w-12 h-12 bg-[#E36414] rounded-full flex items-center justify-center mb-3">
                              <Star size={22} className="text-white fill-white" />
                            </div>
                            <p className="text-sm font-bold text-gray-900 mb-1">Promoveaza aici!</p>
                            <p className="text-xs text-gray-500 mb-1">Anuntul tau ajunge la mii de romani din UK</p>
                            <p className="text-xs text-gray-400 mb-3">Vizibilitate maxima · Start imediat</p>
                            <span className="bg-[#E36414] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                              De la £1.99 / saptamana
                            </span>
                          </Link>
                        );
                        gridPos++;
                      }
                    } else {
                      items.push(
                        <Link
                          key={anunt.id}
                          href={`/anunturi/${anunt.slug}`}
                          className="bg-white border border-gray-100 rounded-xl overflow-hidden flex hover:border-gray-200 hover:shadow-md transition-all group"
                        >
                          <div className="w-28 min-h-[104px] bg-[#F0EBE3] flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                            {anunt.images?.[0] ? (
                              <img src={anunt.images[0]} alt={anunt.title} className="w-full h-full object-cover" />
                            ) : (
                              <Icon size={32} className="text-gray-300" />
                            )}
                            {anunt.images?.length > 1 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                                {anunt.images.length} foto
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-3 min-w-0">
                            <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-0.5", categoryColor)}>
                              {anunt.category}
                            </p>
                            <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-[#2D6A4F] transition-colors">
                              {anunt.title}
                            </p>
                            <p className="text-base font-semibold text-[#E36414] mb-1.5">
                              {anunt.price ? (
                                <>£{anunt.price}{anunt.price_unit && <span className="text-xs text-gray-400 font-normal ml-0.5">/ {anunt.price_unit}</span>}</>
                              ) : (
                                <span className="text-sm text-gray-400 font-normal">La cerere</span>
                              )}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin size={11} />
                                <span className="text-[11px] truncate">{anunt.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-300">
                                <Clock size={11} />
                                <span className="text-[11px]">{timeAgo(anunt.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {anunt.profiles?.rating_avg > 0 && (
                                <div className="flex items-center gap-0.5">
                                  <Star size={11} className="text-[#E36414] fill-[#E36414]" />
                                  <span className="text-[11px] text-gray-500">{anunt.profiles.rating_avg}</span>
                                </div>
                              )}
                              {anunt.profiles?.is_verified && (
                                <span className="text-[10px] text-[#2D6A4F] font-medium bg-[#E8F4EF] px-1.5 py-0.5 rounded">
                                  Verificat
                                </span>
                              )}
                              <div className="flex items-center gap-0.5 ml-auto">
                                <Eye size={11} className="text-gray-300" />
                                <span className="text-[11px] text-gray-300">{anunt.views}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                      gridPos++;
                    }
                  });

                  return items;
                })()}
              </div>
            )}

            <Link
              href="/anunturi"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-medium text-[#2D6A4F] hover:bg-[#E8F4EF] transition-colors"
            >
              Vezi toate anunturile ({totalListings || 0})
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#2D6A4F] rounded-xl p-5 text-white">
              <h3 className="font-serif text-lg font-medium mb-1">Ai ceva de oferit?</h3>
              <p className="text-white/70 text-sm mb-4">
                Posteaza gratuit si ajungi la mii de romani din UK.
              </p>
              <Link
                href="/anunturi/nou"
                className="w-full bg-[#E36414] text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                + Adauga anunt gratuit
              </Link>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Zone populare</h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {ZONE.filter((z) => z.id !== "all").slice(0, 12).map((zona) => (
                  <Link
                    key={zona.id}
                    href={`/anunturi?zona=${zona.id}`}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2D6A4F] transition-colors py-0.5"
                  >
                    <MapPin size={11} className="text-[#E36414] flex-shrink-0" />
                    <span className="truncate">{zona.label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/anunturi" className="mt-3 text-xs text-[#2D6A4F] font-medium flex items-center gap-0.5">
                Vezi toate orasele <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}