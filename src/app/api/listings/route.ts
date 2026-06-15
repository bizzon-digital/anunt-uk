import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { slugify, generateListingId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title, description, category, subcategory,
    price, price_unit, price_type, bills_included,
    location, postcode, show_exact_location,
    images, contact_methods, whatsapp, phone,
  } = body;

  if (!title || !description || !category || !location) {
    return NextResponse.json({ error: "Campuri obligatorii lipsa" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  const uniqueSlug = `${baseSlug}-${Date.now()}`;
  const listingId = generateListingId();

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      title,
      slug: uniqueSlug,
      description,
      category,
      subcategory: subcategory || null,
      price: price ? parseFloat(price) : null,
      price_unit: price_unit || null,
      price_type: price_type || "fix",
      bills_included: bills_included ?? null,
      location,
      postcode: postcode || null,
      show_exact_location: show_exact_location || false,
      images: images || [],
      contact_methods: contact_methods || ["message"],
      whatsapp: whatsapp || null,
      phone: phone || null,
      listing_id: listingId,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing: data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const zone = searchParams.get("zone");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("listings")
    .select("*, profiles(id, full_name, avatar_url, rating_avg, rating_count, is_verified)", { count: "exact" })
    .eq("status", "active")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") query = query.eq("category", category);
  if (zone && zone !== "all") query = query.ilike("location", `%${zone}%`);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data, total: count, page, limit });
}


