import { createClient } from "@/lib/supabase/server";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1000);

  const listingUrls = (listings || []).map((listing) => ({
    url: `https://anunt.co.uk/anunturi/${listing.slug}`,
    lastModified: new Date(listing.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: "https://anunt.co.uk", lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: "https://anunt.co.uk/anunturi", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: "https://anunt.co.uk/anunturi?categorie=chirie", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://anunt.co.uk/anunturi?categorie=joburi", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://anunt.co.uk/anunturi?categorie=masini", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://anunt.co.uk/anunturi?categorie=servicii", lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: "https://anunt.co.uk/termeni", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: "https://anunt.co.uk/confidentialitate", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: "https://anunt.co.uk/gdpr", lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  return [...staticPages, ...listingUrls];
}