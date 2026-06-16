import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "Anunt.co.uk — Anunturi pentru romanii din UK",
    template: "%s | Anunt.co.uk",
  },
  description: "Platforma de anunturi pentru comunitatea romaneasca din Regatul Unit. Chirie, joburi, masini, servicii si multe altele.",
  keywords: ["anunturi romani uk", "romani londra", "chirie uk romani", "joburi uk romani", "anunturi gratuite uk"],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://anunt.co.uk",
    siteName: "Anunt.co.uk",
    title: "Anunt.co.uk — Anunturi pentru romanii din UK",
    description: "Platforma de anunturi pentru comunitatea romaneasca din Regatul Unit.",
    images: [{ url: "https://anunt.co.uk/og-image.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://anunt.co.uk" },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  let user = null;
  let profile = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, credits")
        .eq("id", user.id)
        .single();
      profile = p;
    }
  } catch {}
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF7F2" }}>
      <Header user={user} profile={profile} />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <CookieBanner />
      <BottomNav user={user} />
    </div>
  );
}