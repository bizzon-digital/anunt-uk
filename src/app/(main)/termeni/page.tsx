import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermeniPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-1 text-[#2D6A4F] text-sm mb-6">
        <ArrowLeft size={16} /> Inapoi
      </Link>
      <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">Termeni si Conditii</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima actualizare: Ianuarie 2025</p>

      <div className="prose prose-sm max-w-none flex flex-col gap-6">
        {[
          {
            title: "1. Acceptarea Termenilor",
            content: "Prin accesarea si utilizarea platformei Anunturi.uk, acceptati in mod expres prezentii Termeni si Conditii. Daca nu sunteti de acord cu acesti termeni, va rugam sa nu utilizati platforma noastra."
          },
          {
            title: "2. Descrierea Serviciului",
            content: "Anunturi.uk este o platforma online de anunturi clasificate dedicata comunitatii romanesti din Regatul Unit. Platforma permite utilizatorilor sa publice, sa vizualizeze si sa raspunda la anunturi in diverse categorii."
          },
          {
            title: "3. Contul de Utilizator",
            content: "Pentru a publica anunturi, trebuie sa creati un cont. Sunteti responsabil pentru mentinerea confidentialitatii datelor de autentificare si pentru toate activitatile desfasurate in contul dvs. Anunturi.uk nu este responsabila pentru accesul neautorizat la contul dvs."
          },
          {
            title: "4. Regulile de Publicare",
            content: "Este interzisa publicarea de anunturi false, inselatoare sau frauduloase. Toate anunturile sunt supuse verificarii de catre echipa noastra. Ne rezervam dreptul de a sterge orice anunt care incalca regulile platformei, fara notificare prealabila."
          },
          {
            title: "5. Continut Interzis",
            content: "Este strict interzisa publicarea de: continut ilegal, discriminatoriu sau ofensator; anunturi de vanzare de substante ilegale; continut sexual explicit; informatii personale ale tertilor fara consimtamant; spam sau continut publicitar neautorizat."
          },
          {
            title: "6. Plati si Promovare",
            content: "Publicarea anunturilor de baza este gratuita. Serviciile de promovare platite sunt supuse tarifelor afisate pe platforma. Platile sunt procesate securizat prin Stripe. Nu efectuam rambursari pentru serviciile de promovare deja activate."
          },
          {
            title: "7. Limitarea Raspunderii",
            content: "Anunturi.uk actioneaza exclusiv ca intermediar intre vanzatori si cumparatori. Nu suntem responsabili pentru tranzactiile efectuate intre utilizatori, pentru calitatea produselor sau serviciilor anuntate, sau pentru orice daune rezultate din utilizarea platformei."
          },
          {
            title: "8. Proprietatea Intelectuala",
            content: "Continutul platformei Anunturi.uk, inclusiv logo-ul, designul si codul sursa, este protejat de drepturile de autor. Este interzisa reproducerea sau utilizarea acestora fara acordul nostru scris."
          },
          {
            title: "9. Modificarea Termenilor",
            content: "Ne rezervam dreptul de a modifica acesti termeni in orice moment. Modificarile vor fi publicate pe aceasta pagina. Continuarea utilizarii platformei dupa publicarea modificarilor constituie acceptarea noilor termeni."
          },
          {
            title: "10. Contact",
            content: "Pentru orice intrebari legate de acesti termeni, ne puteti contacta la: legal@anunturi.uk"
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