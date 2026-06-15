"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Bell, MessageCircle, ChevronDown, LogOut, User, Settings, Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";
import type { Profile, Notification } from "@/types";

interface HeaderProps {
  user: any;
  profile: Partial<Profile> | null;
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadMessages();
    const channel = supabase
      .channel("header-notifs")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node))
        setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  }

  async function fetchUnreadMessages() {
  const { data } = await supabase
    .from("conversations")
    .select("buyer_unread, seller_unread, buyer_id, seller_id")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
  if (data) {
    const total = data.reduce((acc: number, c: any) => {
      if (c.buyer_id === user.id) return acc + (c.buyer_unread || 0);
      if (c.seller_id === user.id) return acc + (c.seller_unread || 0);
      return acc;
    }, 0);
    setUnreadMessages(total);
  }
}

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function markOneRead(notifId: string) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const notifIcons: Record<string, string> = {
    message: "💬",
    listing_approved: "✅",
    listing_rejected: "❌",
    new_review: "⭐",
    promotion_expired: "⏰",
  };

  return (
    <header className="bg-[#2D6A4F] sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between gap-3 max-w-6xl mx-auto w-full">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-[#FAF7F2] font-serif text-xl font-medium tracking-tight">Anunțuri</span>
          <span className="text-[#E36414] font-serif text-xl font-medium">.uk</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Mesaje */}
              <Link href="/messages" className="relative p-1">
                <MessageCircle size={22} className="text-[#FAF7F2]" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#E36414] text-white text-[10px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notificari */}
              <div className="relative" ref={notifsRef}>
                <button
                  onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                  className="relative p-1"
                >
                  <Bell size={22} className="text-[#FAF7F2]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#E36414] text-white text-[10px] font-medium min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-medium text-sm">Notificări</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#2D6A4F] font-medium">
                          Marchează toate citite
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                          Nicio notificare
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markOneRead(notif.id);
                              if (notif.link) router.push(notif.link);
                              setShowNotifs(false);
                            }}
                            className={cn(
                              "px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors",
                              !notif.read && "bg-green-50"
                            )}
                          >
                            <div className="flex gap-3 items-start">
                              <span className="text-lg flex-shrink-0">
                                {notifIcons[notif.type] || "🔔"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-[#E36414] flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1a4f38] border-2 border-[#E36414] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#FAF7F2] text-xs font-medium">
                        {profile?.full_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-[#FAF7F2] hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-[#FAF7F2] border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile?.full_name || "Utilizator"}
                      </p>
                      <p className="text-xs text-[#2D6A4F] font-medium mt-0.5">
                        £{Number(profile?.credits || 0).toFixed(2)} credite
                      </p>
                    </div>
                    <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                      <User size={16} className="text-[#2D6A4F]" /> Profilul meu
                    </Link>
                    <Link href="/profile/edit" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                      <Settings size={16} className="text-gray-500" /> Setări
                    </Link>
                    {profile?.role === "admin" && (
                      <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-t border-gray-100">
                        <Shield size={16} className="text-[#E36414]" /> Panou admin
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors border-t border-gray-100">
                      <LogOut size={16} /> Deconectare
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth" className="bg-[#E36414] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors">
              Intră în cont
            </Link>
          )}

          <Link href="/anunturi/nou" className="hidden sm:flex items-center gap-1 bg-white text-[#2D6A4F] text-sm font-medium px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
            + Adaugă anunț
          </Link>
        </div>
      </div>
    </header>
  );
}