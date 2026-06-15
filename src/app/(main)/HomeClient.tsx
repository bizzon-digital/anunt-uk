"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Briefcase, Home, Car, Wrench, ShoppingBag, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const CATEGORII_QUICK = [
  { id: "chirie", label: "Chirie", icon: Home },
  { id: "joburi", label: "Joburi", icon: Briefcase },
  { id: "masini", label: "Masini", icon: Car },
  { id: "servicii", label: "Servicii", icon: Wrench },
  { id: "vand-cumpar", label: "Vand/Cumpar", icon: ShoppingBag },
];

export default function HomeClient() {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
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
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(6);
    setResults(data || []);
    setLoading(false);
  }

  function saveRecentSearch(q: string) {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  function handleSearch(q?: string) {
    const searchTerm = q || query;
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    setShowDropdown(false);
    router.push(`/anunturi?q=${encodeURIComponent(searchTerm)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setShowDropdown(false);
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  }

  const categoryIcons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car,
    servicii: Wrench, "vand-cumpar": ShoppingBag,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl flex items-center px-4 py-3 gap-3 shadow-lg">
        <Search size={20} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cauta chirie, joburi, masini, servicii..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}>
            <X size={16} className="text-gray-400" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="bg-[#E36414] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex-shrink-0"
        >
          Cauta
        </button>
      </div>

      {/* DROPDOWN */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Rezultate live */}
          {query.trim() && (
            <div>
              {loading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Se cauta...</div>
              ) : results.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-400 font-medium border-b border-gray-50">
                    {results.length} rezultate pentru "{query}"
                  </div>
                  {results.map((item) => {
                    const Icon = categoryIcons[item.category] || ShoppingBag;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { saveRecentSearch(query); router.push(`/anunturi/${item.slug}`); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
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
                            {item.price_unit && <span className="text-xs text-gray-400 font-normal">/{item.price_unit}</span>}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleSearch()}
                    className="w-full px-4 py-3 text-sm text-[#2D6A4F] font-medium hover:bg-[#E8F4EF] transition-colors flex items-center gap-2"
                  >
                    <Search size={14} /> Vezi toate rezultatele pentru "{query}"
                  </button>
                </>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">Niciun rezultat pentru "{query}"</p>
                  <p className="text-xs text-gray-400">Incearca alt termen de cautare</p>
                </div>
              )}
            </div>
          )}

          {/* Fara query — recent + sugestii */}
          {!query.trim() && (
            <div>
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">Cautari recente</span>
                    <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-gray-600">Sterge</button>
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); handleSearch(s); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{s}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-2">Categorii populare</p>
                <div className="flex flex-wrap gap-2 pb-2">
                  {CATEGORII_QUICK.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { router.push(`/anunturi?categorie=${cat.id}`); setShowDropdown(false); }}
                        className="flex items-center gap-1.5 bg-[#E8F4EF] text-[#2D6A4F] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#d4eee0] transition-colors"
                      >
                        <Icon size={12} /> {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}