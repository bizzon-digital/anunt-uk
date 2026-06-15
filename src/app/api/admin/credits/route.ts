import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const { userId, amount } = await request.json();
  const adminSupabase = createAdminClient();

  const { data: userProfile } = await adminSupabase
    .from("profiles").select("credits").eq("id", userId).single();

  const newCredits = (userProfile?.credits || 0) + amount;

  const { error } = await adminSupabase
    .from("profiles").update({ credits: newCredits }).eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await adminSupabase.from("notifications").insert({
    user_id: userId,
    type: "listing_approved",
    title: "Credite adaugate!",
    body: `£${amount} credite au fost adaugate in contul tau.`,
    link: "/profile/credite",
  });

  return NextResponse.json({ credits: newCredits });
}