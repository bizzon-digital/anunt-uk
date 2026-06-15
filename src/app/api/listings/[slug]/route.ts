import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`*, profiles(id, full_name, avatar_url, rating_avg, rating_count, is_verified, response_rate, created_at, location)`)
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Anunt negasit" }, { status: 404 });
  }

  await supabase
    .from("listings")
    .update({ views: (data.views || 0) + 1 })
    .eq("id", data.id);

  const { data: alteAnunturi } = await supabase
    .from("listings")
    .select("id, title, price, price_unit, category, slug, images")
    .eq("user_id", data.user_id)
    .eq("status", "active")
    .neq("id", data.id)
    .limit(4);

  return NextResponse.json({ listing: data, alteAnunturi: alteAnunturi || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("slug", params.slug)
    .single();

  if (!listing || listing.user_id !== user.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("listings")
    .update(body)
    .eq("slug", params.slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("slug", params.slug)
    .single();

  if (!listing || listing.user_id !== user.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("slug", params.slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}