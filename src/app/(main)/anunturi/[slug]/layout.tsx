import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: anunt } = await supabase
    .from("listings")
    .select("title, description, images, location, price, category")
    .eq("slug", params.slug)
    .single();

  if (!anunt) return { title: "Anunt negasit" };

  const title = `${anunt.title} â€” ${anunt.location}`;
  const description = anunt.description
    ? anunt.description.substring(0, 160)
    : `${anunt.category} in ${anunt.location}${anunt.price ? ` â€” GBP ${anunt.price}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: anunt.images?.[0] ? [{ url: anunt.images[0] }] : [],
    },
  };
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
