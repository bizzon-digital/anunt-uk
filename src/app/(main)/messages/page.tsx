import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: conversations, error } = await supabase
  .from("conversations")
  .select(`
    *,
    listing:listings(id, title, images, slug, price, price_unit),
    buyer:profiles!buyer_id(id, full_name, avatar_url),
    seller:profiles!seller_id(id, full_name, avatar_url)
  `)
  .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
  .order("last_message_at", { ascending: false });

console.log("Conversations:", conversations, "Error:", error);

  return (
    <MessagesClient
      conversations={conversations || []}
      currentUserId={user.id}
    />
  );
}