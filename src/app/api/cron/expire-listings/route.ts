import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verificare secret pentru securitate
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 1. Expira anunturile care au trecut de expires_at
  const { data: expiredListings, error: expireError } = await supabase
    .from("listings")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("expires_at", now)
    .select("id, user_id, title");

  // 2. Notifica utilizatorii despre anunturile expirate
  if (expiredListings && expiredListings.length > 0) {
    const notifications = expiredListings.map((l) => ({
      user_id: l.user_id,
      type: "promotion_expired",
      title: "Anunt expirat",
      body: `Anuntul "${l.title}" a expirat. Il poti republica din profilul tau.`,
      link: "/profile",
    }));
    await supabase.from("notifications").insert(notifications);
  }

  // 3. Notifica pentru anunturi care expira in 3 zile
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);

  const { data: expiringSoon } = await supabase
    .from("listings")
    .select("id, user_id, title")
    .eq("status", "active")
    .lt("expires_at", in3Days.toISOString())
    .gt("expires_at", now);

  if (expiringSoon && expiringSoon.length > 0) {
    const notifications = expiringSoon.map((l) => ({
      user_id: l.user_id,
      type: "promotion_expired",
      title: "Anunt pe cale sa expire",
      body: `Anuntul "${l.title}" expira in 3 zile. Prelungeste-l din profilul tau.`,
      link: "/profile",
    }));
    await supabase.from("notifications").insert(notifications);
  }

  // 4. Expira promotiile care au trecut de promotion_expires_at
  const { data: expiredPromos } = await supabase
    .from("listings")
    .update({ is_promoted: false, promotion_plan: "free" })
    .eq("is_promoted", true)
    .lt("promotion_expires_at", now)
    .select("id, user_id, title");

  if (expiredPromos && expiredPromos.length > 0) {
    const notifications = expiredPromos.map((l) => ({
      user_id: l.user_id,
      type: "promotion_expired",
      title: "Promotie expirata",
      body: `Promotia pentru anuntul "${l.title}" a expirat.`,
      link: "/profile/promovare",
    }));
    await supabase.from("notifications").insert(notifications);
  }

  return NextResponse.json({
    success: true,
    expired: expiredListings?.length || 0,
    expiringSoon: expiringSoon?.length || 0,
    expiredPromos: expiredPromos?.length || 0,
  });
}