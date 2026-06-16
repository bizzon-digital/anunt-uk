import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, Star, Eye, ShieldCheck,
  Home, Briefcase, Car, Wrench, ShoppingBag, MoreHorizontal,
  MessageCircle, ChevronRight,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { Metadata } from "next";

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag,
  };
  return icons[category] || MoreHorizontal;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", params.id)
    .single();

  if (!profile) return { title: "Utilizator negasit" };
  return {
    title: `${profile.full_name?.split(" ")[0]} — Anunt.co.uk`,
    description: `Vezi anunturile publicate de ${profile.full_name?.split(" ")[0]} pe Anunt.co.uk`,
  };
}

export default async function ProfilPublicPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, rating_avg, rating_count, is_verified, response_rate, created_at, location")
    .eq("id", params.id)
    .single();

  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, price_unit, category, slug, images, location, created_at, views")
    .eq("user_id", params.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const firstName = profile.full_name?.split(" ")[0] || "Utilizator";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* HEADER PROFIL */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 border-3 border-[#E36414] overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-medium">
                {firstName[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-semibold text-gray-900">{firstName}</h1>
              {profile.is_verified && (
                <span className="flex items-center gap-1 text-xs bg-[#E8F4EF] text-[#2D6A4F] px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck size={12} /> Verificat
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Pe site din {new Date(profile.created_at).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-[#FAF7F2] rounded-xl py-3 text-center">
            <p className="text-xl font-semibold text-gray-900">{listings?.length || 0}</p>
            <p className="text-xs text-gray-400">Anunturi active</p>
          </div>
          <div className="bg-[#FAF7F2] rounded-xl py-3 text-center">
            <p className="text-xl font-semibold text-[#E36414]">
              {profile.rating_avg > 0 ? profile.rating_avg : "N/A"}
              {profile.rating_avg > 0 && <Star size={14} className="inline ml-1 fill-[#E36414] text-[#E36414]" />}
            </p>
            <p className="text-xs text-gray-400">Rating</p>
          </div>
          <div className="bg-[#FAF7F2] rounded-xl py-3 text-center">
            <p className="text-xl font-semibold text-gray-900">{profile.response_rate || 0}%</p>
            <p className="text-xs text-gray-400">Raspuns</p>
          </div>
        </div>
      </div>

      {/* ANUNTURI */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Anunturile lui {firstName} ({listings?.length || 0})
        </h2>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-400">Niciun anunt activ momentan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {listings.map((anunt) => {
            const Icon = getCategoryIcon(anunt.category);
            return (
              <Link
                key={anunt.id}
                href={`/anunturi/${anunt.slug}`}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden flex hover:shadow-md transition-all group"
              >
                <div className="w-28 min-h-[100px] bg-[#F0EBE3] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {anunt.images?.[0] ? (
                    <img src={anunt.images[0]} alt={anunt.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={28} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 p-3 min-w-0">
                  <p className="text-xs font-semibold text-[#2D6A4F] uppercase tracking-wide mb-0.5">{anunt.category}</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-[#2D6A4F] transition-colors">{anunt.title}</p>
                  <p className="text-base font-semibold text-[#E36414] mb-1">
                    {anunt.price ? <>£{anunt.price}{anunt.price_unit && <span className="text-xs text-gray-400 font-normal ml-0.5">/{anunt.price_unit}</span>}</> : <span className="text-sm text-gray-400 font-normal">La cerere</span>}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={11} />{anunt.location}</span>
                    <span className="flex items-center gap-1"><Eye size={11} />{anunt.views}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}