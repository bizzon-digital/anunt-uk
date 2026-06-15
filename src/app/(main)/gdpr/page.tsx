import Link from "next/link";
import { ArrowLeft, Shield, Eye, Trash2, Download, RefreshCw, X } from "lucide-react";

export default function GdprPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-1 text-[#2D6A4F] text-sm mb-6">
        <ArrowLeft size={16} /> Inapoi
      </Link>
      <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">Drepturile Tale GDPR</h1>
      <p className="text-sm text-gray-400 mb-8">Conform Regulamentului General privind Protectia Datelor (GDPR)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { icon: Eye, title: "Dreptul de Acces", desc: "Poti solicita oricand o copie a datelor personale pe care le detinem despre tine." },
          { icon: RefreshCw, title: "Dreptul de Rectificare", desc: "Poti corecta datele incorecte sau incomplete direct din setarile contului." },
          { icon: Trash2, title: "Dreptul de Stergere", desc: "Poti solicita stergerea datelor tale personale ('dreptul de a fi uitat')." },
          { icon: Download, title: "Portabilitatea Datelor", desc: "Poti solicita datele tale intr-un format structurat, lizibil de masina." },
          { icon: X, title: "Dreptul de Opozitie", desc: "Te poti opune prelucrarii datelor tale in anumite circumstante." },
          { icon: Shield, title: "Dreptul la Restrictie", desc: "Poti solicita limitarea modului in care folosim datele tale." },
        ].map((right) => {
          const Icon = right.icon;
          return (
            <div key={right.title} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-[#E8F4EF] rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-[#2D6A4F]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{right.title}</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{right.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#E8F4EF] border border-[#a8d5bc] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#2D6A4F] mb-2">Exercita-ti drepturile</h2>
        <p className="text-sm text-gray-600 mb-3">
          Pentru a-ti exercita oricare dintre drepturile de mai sus, contacteaza-ne la:
        </p>
        <a href="mailto:gdpr@anunturi.uk" className="text-[#2D6A4F] font-medium text-sm">
          gdpr@anunturi.uk
        </a>
        <p className="text-xs text-gray-400 mt-2">
          Vom raspunde solicitarii tale in termen de 30 de zile calendaristice.
        </p>
      </div>
    </div>
  );
}