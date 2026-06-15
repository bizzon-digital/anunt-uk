import { createClient } from "@/lib/supabase/server";
import AnunturiClient from "./AnunturiClient";

export default async function AnunturiPage({
  searchParams,
}: {
  searchParams: { q?: string; categorie?: string; zona?: string; page?: string };
}) {
  const supabase = createClient();

  const q = searchParams.q || "";
  const categorie = searchParams.categorie || "all";
  const zona = searchParams.zona || "all";
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("listings")
    .select("*, profiles(id, full_name, avatar_url, rating_avg, is_verified)", { count: "exact" })
    .eq("status", "active")
    .order("is_promoted", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorie !== "all") query = query.eq("category", categorie);
  if (zona !== "all") query = query.ilike("location", `%${zona}%`);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data: listings, count } = await query;

  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <AnunturiClient
      initialListings={listings || []}
      totalCount={count || 0}
      initialFilters={{ q, categorie, zona, page }}
      totalListings={totalListings || 0}
      totalUsers={totalUsers || 0}
    />
  );
}