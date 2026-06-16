import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto">
        
        {/* Numar 404 */}
        <div className="font-serif text-[120px] font-bold text-[#2D6A4F] opacity-20 leading-none mb-0">
          404
        </div>
        
        <div className="-mt-8 mb-6">
          <h1 className="text-2xl font-serif font-medium text-gray-900 mb-3">
            Pagina nu a fost gasita
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Ne pare rau, pagina pe care o cauti nu exista sau a fost mutata. 
            Incearca sa cauti un anunt sau mergi la pagina principala.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#2D6A4F] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#235a3f] transition-colors"
          >
            <Home size={18} /> Pagina principala
          </Link>
          <Link
            href="/anunturi"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Search size={18} /> Cauta anunturi
          </Link>
        </div>

        <Link
          href="javascript:history.back()"
          className="inline-flex items-center gap-1 text-sm text-gray-400 mt-6 hover:text-[#2D6A4F] transition-colors"
        >
          <ArrowLeft size={14} /> Inapoi la pagina anterioara
        </Link>

      </div>
    </div>
  );
}