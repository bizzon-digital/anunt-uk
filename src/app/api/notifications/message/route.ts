import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNewMessageEmail } from "@/lib/emails";

export async function POST(request: NextRequest) {
  const { toUserId, fromName, message, listingTitle } = await request.json();

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", toUserId)
    .single() as { data: { email: string; full_name: string } | null };

  if (!profile?.email) {
    return NextResponse.json({ error: "No email" }, { status: 400 });
  }

  await sendNewMessageEmail(
    profile.email,
    profile.full_name || "utilizator",
    fromName,
    message,
    listingTitle
  );

  return NextResponse.json({ success: true });
}