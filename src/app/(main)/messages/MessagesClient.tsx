"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";
import {
  Send, ArrowLeft, MessageCircle, Home, Briefcase,
  Car, Wrench, ShoppingBag, MoreHorizontal, Search,
} from "lucide-react";
import Link from "next/link";

function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    chirie: Home, joburi: Briefcase, masini: Car, servicii: Wrench,
    "vand-cumpar": ShoppingBag,
  };
  return icons[category] || MoreHorizontal;
}

export default function MessagesClient({
  conversations,
  currentUserId,
}: {
  conversations: any[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [localConvs, setLocalConvs] = useState(conversations);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.id);

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          if (payload.new.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, payload.new]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    const convChannel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          setLocalConvs((prev) => prev.map((c) =>
            c.id === payload.new.id ? { ...c, ...payload.new } : c
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function fetchMessages(convId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(full_name, avatar_url)")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", currentUserId);

    const isBuyer = activeConv?.buyer_id === currentUserId;
    await supabase
      .from("conversations")
      .update(isBuyer ? { buyer_unread: 0 } : { seller_unread: 0 })
      .eq("id", convId);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const { data: newMsg, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConv.id,
        sender_id: currentUserId,
        content,
      })
      .select("*, profiles(full_name, avatar_url)")
      .single();

    if (!error && newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();

      const isBuyer = activeConv.buyer_id === currentUserId;
      await supabase
        .from("conversations")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          buyer_unread: isBuyer ? 0 : (activeConv.buyer_unread || 0) + 1,
          seller_unread: !isBuyer ? 0 : (activeConv.seller_unread || 0) + 1,
        })
        .eq("id", activeConv.id);

      setLocalConvs((prev) => prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
          : c
      ));

      const otherUserId = activeConv.buyer_id === currentUserId
        ? activeConv.seller_id
        : activeConv.buyer_id;

      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUserId)
        .single();

      await fetch("/api/notifications/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: otherUserId,
          fromName: senderProfile?.full_name || "Utilizator",
          message: content,
          listingTitle: activeConv.listing?.title,
          listingSlug: activeConv.listing?.slug,
        }),
      });
    }

    setSending(false);
  }

  const filteredConvs = localConvs.filter((c) => {
    const other = c.buyer_id === currentUserId ? c.seller : c.buyer;
    return other?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.listing?.title?.toLowerCase().includes(search.toLowerCase());
  });

  const unreadCount = localConvs.reduce((acc, c) => {
    return acc + (c.buyer_id === currentUserId ? c.buyer_unread : c.seller_unread);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-57px)] flex flex-col overflow-x-hidden">
      <div className="flex flex-1 overflow-hidden">

        {/* LISTA CONVERSATII */}
        <div className={cn(
          "w-full lg:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white",
          activeConv ? "hidden lg:flex" : "flex"
        )}>
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-semibold text-gray-900">
                Mesaje
                {unreadCount > 0 && (
                  <span className="ml-2 bg-[#E36414] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cauta conversatie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle size={40} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-400">Nicio conversatie</p>
                <p className="text-xs text-gray-300 mt-1">Trimite un mesaj de pe un anunt</p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const other = conv.buyer_id === currentUserId ? conv.seller : conv.buyer;
                const unread = conv.buyer_id === currentUserId ? conv.buyer_unread : conv.seller_unread;
                const isActive = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left",
                      isActive && "bg-[#E8F4EF]"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {other?.avatar_url ? (
                        <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {other?.full_name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn("text-sm truncate", unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                          {other?.full_name || "Utilizator"}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
  {timeAgo(conv.last_message_at)}
</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conv.last_message || "Conversatie noua"}</p>
                        {unread > 0 && (
                          <span className="ml-1 bg-[#E36414] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                      {conv.listing && (
                        <p className="text-sm text-[#2D6A4F] truncate mt-0.5">
  Re: {conv.listing.title}
</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className={cn(
          "flex-1 flex flex-col bg-[#FAF7F2]",
          !activeConv ? "hidden lg:flex" : "flex"
        )}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Selecteaza o conversatie</p>
              <p className="text-gray-300 text-sm mt-1">sau trimite un mesaj de pe un anunt</p>
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setActiveConv(null)}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                {(() => {
                  const other = activeConv.buyer_id === currentUserId ? activeConv.seller : activeConv.buyer;
                  return (
                    <>
                      <div className="w-9 h-9 rounded-full bg-[#2D6A4F] flex items-center justify-center overflow-hidden">
                        {other?.avatar_url ? (
                          <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {other?.full_name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{other?.full_name || "Utilizator"}</p>
                        {activeConv.listing && (
                          <Link
                            href={`/anunturi/${activeConv.listing.slug}`}
                            className="text-xs text-[#2D6A4F] hover:underline truncate block"
                          >
                            Re: {activeConv.listing.title}
                            {activeConv.listing.price && ` · £${activeConv.listing.price}`}
                          </Link>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {activeConv.listing && (
                <Link
                  href={`/anunturi/${activeConv.listing.slug}`}
                  className="mx-4 mt-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 p-3 hover:border-gray-200 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#F0EBE3] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {activeConv.listing.images?.[0] ? (
                      <img src={activeConv.listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activeConv.listing.title}</p>
                    {activeConv.listing.price && (
                      <p className="text-sm font-semibold text-[#E36414]">
                        £{activeConv.listing.price}
                        {activeConv.listing.price_unit && (
                          <span className="text-xs text-gray-400 font-normal ml-0.5">/{activeConv.listing.price_unit}</span>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              )}

              <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 overflow-x-hidden">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-400">Niciun mesaj inca. Fii primul!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={cn("flex w-full min-w-0", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn(
  "max-w-[70%] sm:max-w-[75%] rounded-2xl px-3 py-2.5 break-words min-w-0",
  isMine
    ? "bg-[#2D6A4F] text-white rounded-br-sm"
    : "bg-white border border-gray-100 text-gray-900 rounded-bl-sm"
)}>
  <p className="text-base leading-relaxed break-words">{msg.content}</p>
  <p className={cn("text-xs mt-1 text-right", isMine ? "text-white/60" : "text-gray-400")}>
    {timeAgo(msg.created_at)}
    {isMine && msg.read && <span className="ml-1">✓✓</span>}
  </p>
</div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t border-gray-100 px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Scrie un mesaj..."
                    rows={1}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2D6A4F] resize-none max-h-32"
                    style={{ overflowY: "auto" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-[#2D6A4F] rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#235a3f] transition-colors disabled:opacity-50"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}