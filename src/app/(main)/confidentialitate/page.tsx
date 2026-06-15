import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ConfidentialitatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-1 text-[#2D6A4F] text-sm mb-6">
        <ArrowLeft size={16} /> Inapoi
      </Link>
      <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">Politica de Confidentialitate</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima actualizare: Ianuarie 2025</p>

      <div className="flex flex-col gap-6">
        {[
          {
            title: "1. Datele pe care le Colectam",
            content: "Colectam urmatoarele date personale: nume si prenume, adresa de email, numar de telefon (optional), locatia aproximativa, imaginile incarcate in anunturi, istoricul de navigare pe platforma."
          },
          {
            title: "2. Cum Folosim Datele",
            content: "Datele colectate sunt folosite pentru: crearea si gestionarea contului dvs., publicarea si moderarea anunturilor, procesarea platilor, comunicarea cu dvs. despre activitatea contului, imbunatatirea serviciilor noastre."
          },
          {
            title: "3. Stocarea Datelor",
            content: "Datele dvs. sunt stocate securizat pe servere situate in Uniunea Europeana, prin intermediul Supabase. Aplicam masuri tehnice si organizatorice adecvate pentru protectia datelor."
          },
          {
            title: "4. Partajarea Datelor",
            content: "Nu vindem datele dvs. personale catre terti. Partajam date doar cu: procesatori de plati (Stripe) pentru tranzactii, furnizori de servicii de email pentru comunicari, autoritati legale atunci cand suntem obligati prin lege."
          },
          {
            title: "5. Drepturile Dvs.",
            content: "In conformitate cu GDPR, aveti dreptul la: acces la datele personale, rectificarea datelor incorecte, stergerea datelor ('dreptul de a fi uitat'), portabilitatea datelor, opozitia la prelucrare, retragerea consimtamantului."
          },
          {
            title: "6. Cookies",
            content: "Folosim cookies pentru functionarea platformei si analiza traficului. Puteti controla utilizarea cookies din setarile browserului. Refuzarea cookies poate afecta functionalitatea platformei."
          },
          {
            title: "7. Contact GDPR",
            content: "Pentru exercitarea drepturilor dvs. sau pentru orice intrebari legate de datele personale, contactati-ne la: gdpr@anunturi.uk"
          },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-semibold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}