"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  user: any;
}

export default function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
      <div className="w-full max-w-lg mx-auto flex items-end px-2">
        <Link
          href="/"
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 transition-colors",
            isActive("/") ? "text-[#2D6A4F]" : "text-gray-400"
          )}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Acasă</span>
        </Link>

        <Link
          href="/anunturi"
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 transition-colors",
            isActive("/anunturi") && pathname !== "/anunturi/nou"
              ? "text-[#2D6A4F]"
              : "text-gray-400"
          )}
        >
          <Search size={22} />
          <span className="text-[10px] font-medium">Caută</span>
        </Link>

        <div className="flex-1 flex flex-col items-center pb-1">
          <Link
            href={user ? "/anunturi/nou" : "/auth"}
            className="w-12 h-12 bg-[#E36414] rounded-full flex items-center justify-center -mt-5 border-4 border-[#FAF7F2] shadow-md hover:bg-orange-700 transition-colors"
          >
            <Plus size={24} className="text-white" />
          </Link>
          <span className="text-[10px] font-medium text-gray-400 mt-1">Adaugă</span>
        </div>

        <Link
          href={user ? "/messages" : "/auth"}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 transition-colors",
            isActive("/messages") ? "text-[#2D6A4F]" : "text-gray-400"
          )}
        >
          <MessageCircle size={22} />
          <span className="text-[10px] font-medium">Mesaje</span>
        </Link>

        <Link
          href={user ? "/profile" : "/auth"}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2 transition-colors",
            isActive("/profile") ? "text-[#2D6A4F]" : "text-gray-400"
          )}
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
}