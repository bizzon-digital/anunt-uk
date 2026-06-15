import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select("*, listings(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles!reviewer_id(full_name, avatar_url)")
    .eq("reviewed_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ProfileClient
      profile={profile}
      listings={listings || []}
      savedListings={savedListings || []}
      reviews={reviews || []}
    />
  );
}
