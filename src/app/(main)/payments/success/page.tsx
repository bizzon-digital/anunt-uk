"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-[#2D6A4F]" />
        <p className="text-gray-500">Se proceseaza plata...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-[#E8F4EF] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-[#2D6A4F]" />
      </div>
      <h1 className="text-2xl font-serif font-medium text-gray-900 mb-3">
        Plata reusita!
      </h1>
      <p className="text-gray-500 mb-8">
        {type === "credits"
          ? "Creditele au fost adaugate in contul tau."
          : "Anuntul tau a fost promovat cu succes!"}
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/profile"
          className="w-full bg-[#2D6A4F] text-white py-3 rounded-xl text-sm font-medium"
        >
          Mergi la profil
        </Link>
        <Link
          href="/"
          className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium"
        >
          Inapoi la homepage
        </Link>
      </div>
    </div>
  );
}