"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle, XCircle, Flag, Users, FileText,
  AlertTriangle, Eye, Trash2, Shield, ChevronRight,
  Search, Clock, BarChart2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";

const TABS = ["Anunturi", "Utilizatori", "Rapoarte", "Statistici", "Financiar"];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activ", bg: "bg-[#E8F4EF]", text: "text-[#2D6A4F]" },
  pending: { label: "In asteptare", bg: "bg-[#FEF3C7]", text: "text-[#92400e]" },
  rejected: { label: "Respins", bg: "bg-red-50", text: "text-red-600" },
  sold: { label: "Vandut", bg: "bg-gray-100", text: "text-gray-500" },
  expired: { label: "Expirat", bg: "bg-gray-100", text: "text-gray-400" },
};

function PaymentsTab() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, promotions: 0, credits: 0 });

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const adminClient = supabase;
    const { data } = await adminClient
      .from("payments")
      .select("*, profiles(full_name, email)")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setPayments(data);
      const now = new Date();
      const thisMonth = data.filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      setStats({
        total: data.reduce((acc, p) => acc + Number(p.amount), 0),
        thisMonth: thisMonth.reduce((acc, p) => acc + Number(p.amount), 0),
        promotions: data.filter(p => p.type === "promotion").length,
        credits: data.filter(p => p.type === "credits").length,
      });
    }
    setLoadingPayments(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total incasat", value: `£${stats.total.toFixed(2)}`, color: "text-[#2D6A4F]" },
          { label: "Luna aceasta", value: `£${stats.thisMonth.toFixed(2)}`, color: "text-blue-600" },
          { label: "Promotii vandute", value: String(stats.promotions), color: "text-[#E36414]" },
          { label: "Credite vandute", value: String(stats.credits), color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TABEL PLATI */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Ultimele plati</span>
        </div>
        {loadingPayments ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Se incarca...</div>
        ) : payments.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Nicio plata inca</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Utilizator</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Tip</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden lg:table-cell">Data</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Suma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{payment.profiles?.full_name || "—"}</p>
                      <p className="text-xs text-gray-400">{payment.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        payment.type === "promotion"
                          ? "bg-[#FFF0E6] text-[#E36414]"
                          : "bg-[#E8F4EF] text-[#2D6A4F]"
                      }`}>
                        {payment.type === "promotion" ? "Promovare" : "Credite"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">{payment.promotion_plan || "—"}</p>
                      {payment.promotion_days && (
                        <p className="text-xs text-gray-400">{payment.promotion_days} zile</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString("ro-RO")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-gray-900">£{Number(payment.amount).toFixed(2)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ANUNTURI PROMOVATE ACTIVE */}
      <ActivePromotions />
    </div>
  );
}

function ActivePromotions() {
  const supabase = createClient();
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, promotion_plan, promotion_expires_at, profiles(full_name)")
        .eq("is_promoted", true)
        .order("promotion_expires_at", { ascending: true });
      setPromotions(data || []);
    }
    fetch();
  }, []);

  if (promotions.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Promotii active</span>
      </div>
      <div className="divide-y divide-gray-50">
        {promotions.map((p) => {
          const expiresAt = new Date(p.promotion_expires_at);
          const now = new Date();
          const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysLeft <= 3;
          return (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.title}</p>
                <p className="text-xs text-gray-400">{p.profiles?.full_name} · {p.promotion_plan}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${isExpiringSoon ? "text-red-500" : "text-[#2D6A4F]"}`}>
                  {daysLeft > 0 ? `${daysLeft} zile ramase` : "Expirat"}
                </p>
                <p className="text-xs text-gray-400">
                  {expiresAt.toLocaleDateString("ro-RO")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminClient({
  listings, profiles, reports, stats,
}: {
  listings: any[];
  profiles: any[];
  reports: any[];
  stats: { totalActive: number; totalPending: number; totalUsers: number; totalReports: number };
}) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState(0);
  const [searchListings, setSearchListings] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [localListings, setLocalListings] = useState(listings);
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [localReports, setLocalReports] = useState(reports);
  const [loading, setLoading] = useState<string | null>(null);

async function updateListingStatus(id: string, status: string) {
  setLoading(id);
  const response = await fetch("/api/admin/listings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });

  if (response.ok) {
    setLocalListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    window.location.reload();
  }
  setLoading(null);
}

  async function deleteListing(id: string) {
    if (!confirm("Esti sigur ca vrei sa stergi acest anunt?")) return;
    setLoading(id);
    const response = await fetch(`/api/admin/listings?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setLocalListings((prev) => prev.filter((l) => l.id !== id));
    }
    setLoading(null);
  }

  async function toggleVerified(id: string, current: boolean) {
    setLoading(id);
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !current })
      .eq("id", id);
    if (!error) {
      setLocalProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_verified: !current } : p))
      );
    }
    setLoading(null);
  }

  async function addCredits(userId: string, amount: number) {
  setLoading(userId);
  const response = await fetch("/api/admin/credits", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount }),
  });

  const data = await response.json();
  if (response.ok) {
    setLocalProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, credits: data.credits } : p))
    );
    alert(`£${amount} credite adaugate! Sold nou: £${data.credits}`);
  } else {
    alert("Eroare: " + data.error);
  }
  setLoading(null);
}

  async function resolveReport(id: string) {
  setLoading(id);
  const response = await fetch("/api/admin/reports", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (response.ok) {
    setLocalReports((prev) => prev.filter((r) => r.id !== id));
  }
  setLoading(null);
}

  const filteredListings = localListings.filter((l) => {
    const matchSearch =
      l.title?.toLowerCase().includes(searchListings.toLowerCase()) ||
      l.profiles?.email?.toLowerCase().includes(searchListings.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredUsers = localProfiles.filter((p) =>
    p.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-[#2D6A4F]" /> Panou Admin
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Anunturi.uk — Moderare si management</p>
        </div>
        <Link href="/" className="text-sm text-[#2D6A4F] font-medium flex items-center gap-1">
          Vezi site <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Anunturi active", value: stats.totalActive, icon: FileText, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]", alert: false },
          { label: "In asteptare", value: stats.totalPending, icon: Clock, color: "text-[#92400e]", bg: "bg-[#FEF3C7]", alert: stats.totalPending > 0 },
          { label: "Utilizatori", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", alert: false },
          { label: "Rapoarte noi", value: stats.totalReports, icon: Flag, color: "text-red-600", bg: "bg-red-50", alert: stats.totalReports > 0 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={cn("bg-white border rounded-xl p-4 flex items-center gap-3", stat.alert ? "border-orange-200" : "border-gray-100")}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
              {stat.alert && stat.value > 0 && <div className="ml-auto w-2 h-2 bg-[#E36414] rounded-full" />}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            {tab}
            {tab === "Anunturi" && stats.totalPending > 0 && (
              <span className="ml-1.5 bg-[#E36414] text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.totalPending}</span>
            )}
            {tab === "Rapoarte" && stats.totalReports > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.totalReports}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cauta anunt sau email..."
                value={searchListings}
                onChange={(e) => setSearchListings(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "active", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn("text-xs font-medium px-3 py-2 rounded-lg border transition-colors", filterStatus === s ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}
                >
                  {s === "all" ? "Toate" : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Anunt</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Utilizator</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredListings.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Niciun anunt gasit</td></tr>
                  ) : filteredListings.map((listing) => {
                    const statusCfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#F0EBE3] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {listing.images?.[0]
                                ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                : <FileText size={16} className="text-gray-300" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{listing.title}</p>
                              <p className="text-xs text-gray-400">{listing.category} · #{listing.listing_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-700">{listing.profiles?.full_name || "—"}</p>
                          <p className="text-xs text-gray-400">{listing.profiles?.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-gray-500">{timeAgo(listing.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusCfg.bg, statusCfg.text)}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/anunturi/${listing.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye size={16} />
                            </Link>
                            {listing.status === "pending" && (
                              <>
                                <button onClick={() => updateListingStatus(listing.id, "active")} disabled={loading === listing.id} className="p-1.5 text-[#2D6A4F] hover:bg-[#E8F4EF] rounded-lg transition-colors" title="Aproba">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => updateListingStatus(listing.id, "rejected")} disabled={loading === listing.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Respinge">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {listing.status === "active" && (
                              <button onClick={() => updateListingStatus(listing.id, "rejected")} disabled={loading === listing.id} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Dezactiveaza">
                                <XCircle size={16} />
                              </button>
                            )}
                            {listing.status === "rejected" && (
                              <button onClick={() => updateListingStatus(listing.id, "active")} disabled={loading === listing.id} className="p-1.5 text-[#2D6A4F] hover:bg-[#E8F4EF] rounded-lg transition-colors" title="Reactiveaza">
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => deleteListing(listing.id)} disabled={loading === listing.id} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Sterge">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cauta utilizator..."
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#2D6A4F]"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Utilizator</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Credite</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Inregistrat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Niciun utilizator gasit</td></tr>
                ) : filteredUsers.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {profile.avatar_url
                            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-white text-xs font-medium">{profile.full_name?.[0]?.toUpperCase() || "?"}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{profile.full_name || "—"}</p>
                          <p className="text-xs text-gray-400">{profile.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
  <p className="text-sm font-medium text-[#2D6A4F]">£{Number(profile.credits || 0).toFixed(2)}</p>
</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">{timeAgo(profile.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {profile.is_verified ? (
                          <span className="text-xs font-medium bg-[#E8F4EF] text-[#2D6A4F] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={11} /> Verificat
                          </span>
                        ) : (
                          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Neverificat</span>
                        )}
                        {profile.role === "admin" && (
                          <span className="text-xs font-medium bg-[#FEF3C7] text-[#92400e] px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
  <div className="flex items-center justify-end gap-1">
    <button
      onClick={() => toggleVerified(profile.id, profile.is_verified)}
      disabled={loading === profile.id}
      className={cn("p-1.5 rounded-lg transition-colors", profile.is_verified ? "text-orange-500 hover:bg-orange-50" : "text-[#2D6A4F] hover:bg-[#E8F4EF]")}
      title={profile.is_verified ? "Elimina verificare" : "Verifica"}
    >
      <Shield size={16} />
    </button>
    <button
      onClick={() => {
        const input = prompt("Suma credite de adaugat (£):");
        const amount = parseFloat(input || "0");
        if (amount > 0) addCredits(profile.id, amount);
      }}
      disabled={loading === profile.id}
      className="p-1.5 text-[#2D6A4F] hover:bg-[#E8F4EF] rounded-lg transition-colors font-bold text-xs"
      title="Adauga credite"
    >
      £+
    </button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          {localReports.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
              <Flag size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Niciun raport in asteptare</p>
              <p className="text-gray-400 text-sm mt-1">Toate rapoartele au fost rezolvate</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {localReports.map((report) => (
                <div key={report.id} className="bg-white border border-red-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 truncate">{report.listings?.title || "Anunt sters"}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Raportat de <span className="font-medium">{report.profiles?.full_name || report.profiles?.email}</span>
                        {" · "}{timeAgo(report.created_at)}
                      </p>
                      <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-red-700 font-medium">{report.reason}</p>
                        {report.details && <p className="text-xs text-red-600 mt-0.5">{report.details}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {report.listings?.slug && (
                        <Link href={`/anunturi/${report.listings.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => resolveReport(report.id)}
                        disabled={loading === report.id}
                        className="flex items-center gap-1.5 bg-[#E8F4EF] text-[#2D6A4F] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#d4eee0] transition-colors"
                      >
                        <CheckCircle size={14} /> Rezolva
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Anunturi pe categorii", items: [
              { label: "Chirie", value: listings.filter(l => l.category === "chirie").length },
              { label: "Joburi", value: listings.filter(l => l.category === "joburi").length },
              { label: "Masini", value: listings.filter(l => l.category === "masini").length },
              { label: "Servicii", value: listings.filter(l => l.category === "servicii").length },
              { label: "Vand/Cumpar", value: listings.filter(l => l.category === "vand-cumpar").length },
              { label: "Altele", value: listings.filter(l => !["chirie","joburi","masini","servicii","vand-cumpar"].includes(l.category)).length },
            ]},
            { title: "Anunturi pe status", items: [
              { label: "Active", value: listings.filter(l => l.status === "active").length },
              { label: "In asteptare", value: listings.filter(l => l.status === "pending").length },
              { label: "Respinse", value: listings.filter(l => l.status === "rejected").length },
              { label: "Vandute", value: listings.filter(l => l.status === "sold").length },
              { label: "Expirate", value: listings.filter(l => l.status === "expired").length },
            ]},
          ].map((section) => (
            <div key={section.title} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-[#2D6A4F]" />
                <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => {
                  const total = section.items.reduce((acc, i) => acc + i.value, 0);
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{item.label}</span>
                        <span className="text-xs font-medium text-gray-900">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#2D6A4F]" />
              <h3 className="text-sm font-semibold text-gray-900">Utilizatori</h3>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Total utilizatori", value: profiles.length },
                { label: "Verificati", value: profiles.filter(p => p.is_verified).length },
                { label: "Admini", value: profiles.filter(p => p.role === "admin").length },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2D6A4F] border border-gray-100 rounded-xl p-4 text-white">
            <h3 className="text-sm font-semibold mb-4">Actiuni rapide</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab(0)}
                className="w-full bg-white/15 border border-white/20 rounded-lg py-2.5 text-sm font-medium flex items-center justify-between px-3"
              >
                <span>Anunturi in asteptare</span>
                <span className="bg-[#E36414] text-white text-xs px-2 py-0.5 rounded-full">{stats.totalPending}</span>
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className="w-full bg-white/15 border border-white/20 rounded-lg py-2.5 text-sm font-medium flex items-center justify-between px-3"
              >
                <span>Rapoarte noi</span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.totalReports}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 4 && (
        <div className="flex flex-col gap-4">
          {/* LINK STRIPE DASHBOARD */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#635BFF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">Stripe Dashboard</h3>
                <p className="text-xs text-gray-400">Gestioneaza platile si abonamentele</p>
              </div>

              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto bg-[#635BFF] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#4f46e5] transition-colors"
              >
                Deschide Stripe →
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Plati", href: "https://dashboard.stripe.com/payments", desc: "Vezi toate platile" },
                { label: "Clienti", href: "https://dashboard.stripe.com/customers", desc: "Gestioneaza clientii" },
                { label: "Rapoarte", href: "https://dashboard.stripe.com/reports", desc: "Rapoarte financiare" },
                { label: "Setari", href: "https://dashboard.stripe.com/settings", desc: "Configurare cont" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#F5F4FF] border border-[#635BFF]/20 rounded-lg p-3 hover:bg-[#ebe9ff] transition-colors"
                >
                  <p className="text-sm font-medium text-[#635BFF]">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* PLATI DIN DB */}
          <PaymentsTab />
        </div>
      )}

    </div>
  );
}