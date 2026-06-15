import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a3d2b] text-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* BRAND */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 mb-3">
              <span className="font-serif text-xl font-medium text-white">Anunturi</span>
              <span className="font-serif text-xl font-medium text-[#E36414]">.uk</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Platforma de anunturi pentru comunitatea romaneasca din Regatul Unit.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="https://wa.me/447700000000" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold">W</span>
              </a>
            </div>
          </div>

          {/* NAVIGARE */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Navigare</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Acasa", href: "/" },
                { label: "Toate anunturile", href: "/anunturi" },
                { label: "Adauga anunt", href: "/anunturi/nou" },
                { label: "Contul meu", href: "/profile" },
                { label: "Mesaje", href: "/messages" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORII */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Categorii</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Chirie", href: "/anunturi?categorie=chirie" },
                { label: "Joburi", href: "/anunturi?categorie=joburi" },
                { label: "Masini", href: "/anunturi?categorie=masini" },
                { label: "Servicii", href: "/anunturi?categorie=servicii" },
                { label: "Vand / Cumpar", href: "/anunturi?categorie=vand-cumpar" },
                { label: "Matrimoniale", href: "/anunturi?categorie=matrimoniale" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white">Legal & Suport</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Termeni si conditii", href: "/termeni" },
                { label: "Politica de confidentialitate", href: "/confidentialitate" },
                { label: "Politica cookies", href: "/cookies" },
                { label: "GDPR", href: "/gdpr" },
                { label: "Suport & Contact", href: "/profile/suport" },
                { label: "Raporteaza o problema", href: "/profile/suport" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/60 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {year} Anunturi.uk — Toate drepturile rezervate
          </p>
          <div className="flex items-center gap-4">
            <Link href="/termeni" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Termeni
            </Link>
            <Link href="/confidentialitate" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Confidentialitate
            </Link>
            <Link href="/cookies" className="text-white/40 text-xs hover:text-white/70 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}