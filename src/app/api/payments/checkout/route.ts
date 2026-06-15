import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, listingId, promoPlan, promoDays } = body;

  // type: "credits" | "promotion"
  const lineItems = type === "credits" ? [
    {
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Credite Anunturi.uk — £${amount}`,
          description: "Credite pentru promovare anunturi",
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    },
  ] : [
    {
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Promovare ${promoPlan} — ${promoDays} zile`,
          description: `Pachet promovare pentru anuntul tau`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    metadata: {
      user_id: user.id,
      type,
      amount: String(amount),
      listing_id: listingId || "",
      promo_plan: promoPlan || "",
      promo_days: String(promoDays || 0),
    },
  });

  // Salvează plata in DB
  await supabase.from("payments").insert({
    user_id: user.id,
    listing_id: listingId || null,
    amount,
    currency: "gbp",
    type,
    promotion_plan: promoPlan || null,
    promotion_days: promoDays || null,
    status: "pending",
    stripe_payment_intent_id: session.payment_intent as string,
  });

  return NextResponse.json({ url: session.url });
}