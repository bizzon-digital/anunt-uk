import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-1 text-[#2D6A4F] text-sm mb-6">
        <ArrowLeft size={16} /> Inapoi
      </Link>
      <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">Politica de Cookies</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima actualizare: Ianuarie 2025</p>

      <div className="flex flex-col gap-6">
        {[
          {
            title: "Ce sunt Cookies?",
            content: "Cookies sunt fisiere text mici stocate pe dispozitivul tau atunci cand vizitezi un site web. Ele ajuta site-ul sa isi aminteasca preferintele tale si sa functioneze corect."
          },
          {
            title: "Tipuri de Cookies pe care le Folosim",
            items: [
              { name: "Cookies esentiale", desc: "Necesare pentru functionarea platformei (autentificare, sesiune). Nu pot fi dezactivate." },
              { name: "Cookies de performanta", desc: "Analiza traficului si comportamentului utilizatorilor pentru imbunatatirea serviciului." },
              { name: "Cookies functionale", desc: "Retinerea preferintelor tale (limba, zona, cautari recente)." },
            ]
          },
          {
            title: "Durata de Stocare",
            content: "Cookies de sesiune: se sterg la inchiderea browserului. Cookies persistente: raman pana la 12 luni sau pana la stergerea manuala."
          },
          {
            title: "Cum poti Controla Cookies",
            content: "Poti controla si/sau sterge cookies din setarile browserului tau. Retineti ca dezactivarea cookies poate afecta functionarea platformei. Optiunile difera in functie de browser: Chrome, Firefox, Safari, Edge."
          },
          {
            title: "Contact",
            content: "Pentru intrebari despre politica noastra de cookies: cookies@anunturi.uk"
          },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-semibold text-gray-900 mb-2">{section.title}</h2>
            {section.content && <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>}
            {section.items && (
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.name} className="bg-white border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}