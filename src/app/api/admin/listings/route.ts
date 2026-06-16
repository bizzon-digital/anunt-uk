import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status } = body;

  const adminSupabase = createAdminClient();

  const { data: listing } = await adminSupabase
    .from("listings")
    .select("user_id, title, slug")
    .eq("id", id)
    .single();

  const { data, error } = await adminSupabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (listing && (status === "active" || status === "rejected")) {
    await adminSupabase.from("notifications").insert({
      user_id: listing.user_id,
      type: status === "active" ? "listing_approved" : "listing_rejected",
      title: status === "active" ? "Anunt aprobat!" : "Anunt respins",
      body: status === "active"
        ? `Anuntul "${listing.title}" a fost aprobat si este acum vizibil.`
        : `Anuntul "${listing.title}" a fost respins.`,
      link: status === "active" ? `/anunturi/${listing.slug}` : null,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/anunturi");
  revalidatePath("/");

  return NextResponse.json({ listing: data });
}

import { sendListingApprovedEmail, sendListingRejectedEmail } from "@/lib/emails";

// Dupa update status
if (status === "active") {
  const { data: listing } = await adminSupabase
    .from("listings")
    .select("title, slug, profiles(email, full_name)")
    .eq("id", id)
    .single() as { data: any };
  
  if (listing?.profiles?.email) {
    await sendListingApprovedEmail(
      listing.profiles.email,
      listing.profiles.full_name || "utilizator",
      listing.title,
      listing.slug
    );
  }
} else if (status === "rejected") {
  const { data: listing } = await adminSupabase
    .from("listings")
    .select("title, profiles(email, full_name)")
    .eq("id", id)
    .single() as { data: any };
  
  if (listing?.profiles?.email) {
    await sendListingRejectedEmail(
      listing.profiles.email,
      listing.profiles.full_name || "utilizator",
      listing.title
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID lipsa" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("listings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/admin");
  revalidatePath("/anunturi");
  revalidatePath("/");

  return NextResponse.json({ success: true });
}