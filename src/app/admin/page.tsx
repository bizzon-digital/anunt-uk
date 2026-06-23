import { createAdminClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = createAdminClient();

  const { data: listings } = await supabase
  .from("listings")
  .select("*, profiles(id, full_name, email, avatar_url)")
  .order("created_at", { ascending: false })
  .limit(200);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: reports } = await supabase
    .from("reports")
    .select("*, profiles(full_name, email), listings(title, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { count: totalActive } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalPending } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <AdminClient
      listings={listings || []}
      profiles={profiles || []}
      reports={reports || []}
      stats={{
        totalActive: totalActive || 0,
        totalPending: totalPending || 0,
        totalUsers: totalUsers || 0,
        totalReports: totalReports || 0,
      }}
    />
  );
}