"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContactButton({
  listing,
  sellerId,
  sellerPhone,
}: {
  listing: any;
  sellerId: string;
  sellerPhone?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startConversation() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    if (user.id === sellerId) { router.push("/messages"); return; }

    // Cauta conversatie existenta
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .single();

    if (existing) {
      router.push("/messages");
      return;
    }

    // Creeaza conversatie noua
    const { error } = await supabase.from("conversations").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: sellerId,
      last_message: "Conversatie noua",
      last_message_at: new Date().toISOString(),
    });

    if (!error) router.push("/messages");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={startConversation}
        disabled={loading}
        className="w-full bg-[#2D6A4F] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#235a3f] transition-colors disabled:opacity-70"
      >
        <MessageCircle size={18} />
        {loading ? "Se incarca..." : "Trimite mesaj"}
      </button>
      {sellerPhone && (
          <a
          href={`tel:${sellerPhone}`}
          className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Phone size={18} />
          Suna acum
        </a>
      )}
    </div>
  );
}
