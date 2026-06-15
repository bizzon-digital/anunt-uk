"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Mail, MessageCircle, Tag, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTIF_SETTINGS = [
  {
    group: "Anunturi",
    items: [
      { id: "listing_approved", label: "Anunt aprobat", sub: "Cand anuntul tau este aprobat de admin", icon: Check, default: true },
      { id: "listing_rejected", label: "Anunt respins", sub: "Cand anuntul tau este respins", icon: Check, default: true },
      { id: "listing_expiring", label: "Anunt pe cale sa expire", sub: "Cu 3 zile inainte de expirare", icon: Bell, default: true },
    ],
  },
  {
    group: "Mesaje",
    items: [
      { id: "new_message", label: "Mesaj nou", sub: "Cand primesti un mesaj de la un utilizator", icon: MessageCircle, default: true },
      { id: "message_reply", label: "Raspuns la mesaj", sub: "Cand cineva iti raspunde", icon: MessageCircle, default: true },
    ],
  },
  {
    group: "Promotii",
    items: [
      { id: "promo_expiring", label: "Promotie pe cale sa expire", sub: "Cu 24h inainte de expirarea promotiei", icon: Tag, default: true },
      { id: "new_features", label: "Functii noi", sub: "Noutati despre platforma", icon: Bell, default: false },
    ],
  },
  {
    group: "Recenzii",
    items: [
      { id: "new_review", label: "Recenzie noua", sub: "Cand cineva iti lasa o recenzie", icon: Star, default: true },
    ],
  },
];

export default function NotificariPage() {
  const [settings, setSettings] = useState<Record<string, { push: boolean; email: boolean }>>(() => {
    const init: Record<string, { push: boolean; email: boolean }> = {};
    NOTIF_SETTINGS.forEach((group) =>
      group.items.forEach((item) => {
        init[item.id] = { push: item.default, email: item.default };
      })
    );
    return init;
  });
  const [saved, setSaved] = useState(false);

  function toggle(id: string, type: "push" | "email") {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: !prev[id][type] },
    }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Notificari</span>
        <button
          onClick={handleSave}
          className={cn("text-sm font-medium px-4 py-1.5 rounded-full transition-colors", saved ? "bg-[#E8F4EF] text-[#2D6A4F]" : "bg-[#2D6A4F] text-white")}
        >
          {saved ? "Salvat!" : "Salveaza"}
        </button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* CANALE */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Canale de notificare</span>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { icon: Bell, label: "Push notifications", sub: "Notificari in browser / app", id: "push_global" },
              { icon: Mail, label: "Email", sub: "Notificari pe email", id: "email_global" },
              { icon: MessageCircle, label: "WhatsApp", sub: "Notificari pe WhatsApp (in curand)", id: "wa_global", disabled: true },
            ].map((channel) => (
              <div key={channel.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F4EF] flex items-center justify-center flex-shrink-0">
                  <channel.icon size={16} className="text-[#2D6A4F]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{channel.label}</p>
                  <p className="text-xs text-gray-400">{channel.sub}</p>
                </div>
                <button
                  disabled={channel.disabled}
                  className={cn("w-10 h-6 rounded-full relative transition-colors flex-shrink-0", channel.disabled ? "bg-gray-200 opacity-50" : "bg-[#2D6A4F]")}
                >
                  <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all", channel.disabled ? "left-0.5" : "left-[18px]")} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SETARI PE CATEGORII */}
        {NOTIF_SETTINGS.map((group) => (
          <div key={group.group} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-900">{group.group}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {group.items.map((item) => {
                const Icon = item.icon;
                const s = settings[item.id];
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400 mb-2">{item.sub}</p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <div
                              onClick={() => toggle(item.id, "push")}
                              className={cn("w-8 h-5 rounded-full relative transition-colors cursor-pointer", s?.push ? "bg-[#2D6A4F]" : "bg-gray-200")}
                            >
                              <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", s?.push ? "left-[14px]" : "left-0.5")} />
                            </div>
                            <span className="text-xs text-gray-500">Push</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <div
                              onClick={() => toggle(item.id, "email")}
                              className={cn("w-8 h-5 rounded-full relative transition-colors cursor-pointer", s?.email ? "bg-[#2D6A4F]" : "bg-gray-200")}
                            >
                              <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", s?.email ? "left-[14px]" : "left-0.5")} />
                            </div>
                            <span className="text-xs text-gray-500">Email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}