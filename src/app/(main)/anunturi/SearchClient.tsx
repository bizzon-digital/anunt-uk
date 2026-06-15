"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Home, Briefcase, Car, Wrench, ShoppingBag, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const CATEGORII_ICONS: Record<string, any> = {
  chirie: Home, joburi: Briefcase, masini: Car,
  servicii: Wrench, "vand-cumpar": ShoppingBag,
};

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => searchListings(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function searchListings(q: string) {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("id, title, category, price, price_unit, location, images, slug")
      .eq("status", "active")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6);
    setResults(data || []);
    setLoading(false);
  }

  function handleSearch(q?: string) {
    const term = q || query;
    if (!term.trim()) { router.push("/anunturi"); return; }
    setShowDropdown(false);
    router.push(`/anunturi?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="flex items-center gap-2 w-full">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cauta in anunturi..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => query && setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); router.push("/anunturi"); }}>
            <X size={16} className="text-gray-400" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="bg-[#E36414] text-white text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0"
        >
          Cauta
        </button>
      </div>

      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-4 text-center text-sm text-gray-400">Se cauta...</div>
          ) : results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-50">
                {results.length} rezultate pentru "{query}"
              </div>
              {results.map((item) => {
                const Icon = CATEGORII_ICONS[item.category] || ShoppingBag;
                return (
                  <button
                    key={item.id}
                    onClick={() => { router.push(`/anunturi/${item.slug}`); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
                  >
                    <div className="w-10 h-10 bg-[#F0EBE3] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{item.category}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin size={10} /> {item.location}
                        </span>
                      </div>
                    </div>
                    {item.price && (
                      <span className="text-sm font-semibold text-[#E36414] flex-shrink-0">
                        £{item.price}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => handleSearch()}
                className="w-full px-4 py-3 text-sm text-[#2D6A4F] font-medium hover:bg-[#E8F4EF] flex items-center gap-2"
              >
                <Search size={14} /> Vezi toate rezultatele pentru "{query}"
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">Niciun rezultat pentru "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}