"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Mail, MessageCircle, HelpCircle, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Cum public un anunt?",
    a: "Apasa pe butonul + din bara de jos sau + Adauga anunt din header. Completeaza formularul in 4 pasi si trimite anuntul spre aprobare. Anunturile sunt aprobate in maxim 2 ore.",
  },
  {
    q: "Cat costa sa public un anunt?",
    a: "Publicarea unui anunt este complet gratuita. Poti alege optional pachete de promovare (Basic £2.99, Pro £5.99, Top Plus £9.99) pentru mai multa vizibilitate.",
  },
  {
    q: "De ce anuntul meu nu apare?",
    a: "Anunturile noi sunt verificate de echipa noastra inainte de publicare. Procesul dureaza maxim 2 ore. Vei primi o notificare cand anuntul este aprobat sau respins.",
  },
  {
    q: "Cum sterg un anunt?",
    a: "Mergi la Profilul meu -> Anunturile mele si apasa pe iconita de stergere de langa anuntul dorit.",
  },
  {
    q: "Cum imi verific contul?",
    a: "Mergi la Profilul meu -> Verificare cont. Poti verifica emailul, telefonul si identitatea pentru mai multa incredere din partea cumparatorilor.",
  },
  {
    q: "Cum contactez un vanzator?",
    a: "Pe pagina fiecarui anunt gasesti butoanele de contact: WhatsApp, Telefon sau Mesaj intern. Alege metoda preferata.",
  },
];

export default function SuportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendMessage() {
    if (!subject || !message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
    setSubject("");
    setMessage("");
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Suport & ajutor</span>
        <div className="w-16" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* CONTACT RAPID */}
        <div className="grid grid-cols-2 gap-3">
          <a href="mailto:support@anunturi.uk" className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#2D6A4F] transition-colors">
            <div className="w-10 h-10 bg-[#E8F4EF] rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-[#2D6A4F]" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">Trimite email</span>
            <span className="text-[10px] text-gray-400">support@anunturi.uk</span>
          </a>
          <a href="https://wa.me/447700000000" target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#25D366] transition-colors">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <MessageCircle size={20} className="text-[#25D366]" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">WhatsApp</span>
            <span className="text-[10px] text-gray-400">Luni-Vineri 9-18</span>
          </a>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <HelpCircle size={16} className="text-[#2D6A4F]" />
            <span className="text-sm font-medium text-gray-900">Intrebari frecvente</span>
          </div>
          <div className="divide-y divide-gray-50">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
                  <ChevronRight size={16} className={cn("text-gray-400 flex-shrink-0 transition-transform", openFaq === i && "rotate-90")} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TRIMITE MESAJ */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Trimite un mesaj</span>
            <p className="text-xs text-gray-400 mt-0.5">Iti raspundem in maxim 24 ore</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {sent ? (
              <div className="bg-[#E8F4EF] border border-[#a8d5bc] rounded-xl p-4 flex items-center gap-3">
                <Check size={20} className="text-[#2D6A4F]" />
                <div>
                  <p className="text-sm font-medium text-[#2D6A4F]">Mesaj trimis!</p>
                  <p className="text-xs text-[#2D6A4F]/70">Iti vom raspunde in maxim 24 ore.</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Subiect</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Despre ce vrei sa ne scrii?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Mesaj</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descrie problema sau intrebarea ta..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2] resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !subject || !message}
                  className="w-full bg-[#2D6A4F] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : "Trimite mesajul"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}