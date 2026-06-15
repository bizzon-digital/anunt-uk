import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil" as any,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { user_id, type, amount, listing_id, promo_plan, promo_days } = session.metadata!;

    if (type === "credits") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user_id)
        .single() as { data: { credits: number } | null };

      const newCredits = (profile?.credits || 0) + parseFloat(amount);

      await (supabase
        .from("profiles") as any)
        .update({ credits: newCredits })
        .eq("id", user_id);

      await (supabase.from("notifications") as any).insert({
  user_id,
  type: "listing_approved",
  title: "Credite adaugate!",
  body: `£${amount} credite au fost adaugate in contul tau.`,
  link: "/profile",
});

    } else if (type === "promotion" && listing_id) {
      const days = parseInt(promo_days);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      await (supabase
        .from("listings") as any)
        .update({
          is_promoted: true,
          promotion_plan: promo_plan,
          promotion_expires_at: expiresAt.toISOString(),
        })
        .eq("id", listing_id);

      await (supabase.from("notifications") as any).insert({
  user_id,
  type: "listing_approved",
  title: "Anunt promovat!",
  body: `Anuntul tau a fost promovat cu pachetul ${promo_plan} pentru ${days} zile.`,
  link: `/anunturi`,
});
    }

    await (supabase
      .from("payments") as any)
      .update({ status: "completed" })
      .eq("stripe_payment_intent_id", session.payment_intent as string);
  }

  return NextResponse.json({ received: true });
}