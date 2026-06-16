"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) setShow(true);
  }, []);

  function acceptAll() {
    localStorage.setItem("cookies-accepted", "all");
    setShow(false);
  }

  function acceptNecessary() {
    localStorage.setItem("cookies-accepted", "necessary");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-50 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          🍪 Folosim cookies
        </h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Folosim cookies pentru a-ti imbunatati experienta pe site. 
          Poti accepta toate cookies sau doar cele necesare. 
          Afla mai multe in{" "}
          <Link href="/cookies" className="text-[#2D6A4F] underline">
            Politica de cookies
          </Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptNecessary}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Doar necesare
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 bg-[#2D6A4F] text-white font-medium py-2.5 rounded-xl text-sm hover:bg-[#235a3f] transition-colors"
          >
            Accepta toate
          </button>
        </div>
      </div>
    </div>
  );
}