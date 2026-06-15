"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, Check, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SecuritatePage() {
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleChangePassword() {
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Parola noua trebuie sa aiba minim 6 caractere.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });

    if (err) {
      setError("A aparut o eroare. Incearca din nou.");
    } else {
      setSuccess("Parola a fost schimbata cu succes!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  }

  async function handleDeleteAccount() {
    if (!confirm("Esti sigur ca vrei sa stergi contul? Aceasta actiune este ireversibila!")) return;
    if (!confirm("Toate anunturile si datele tale vor fi sterse permanent. Continui?")) return;
    alert("Pentru stergerea contului, te rugam sa contactezi suportul la support@anunturi.uk");
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Securitate & parola</span>
        <div className="w-16" />
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* SCHIMBA PAROLA */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Lock size={16} className="text-[#2D6A4F]" />
            <span className="text-sm font-medium text-gray-900">Schimba parola</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="relative">
              <label className="text-xs text-gray-500 mb-1.5 block">Parola noua</label>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 bottom-2.5 text-gray-400">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <label className="text-xs text-gray-500 mb-1.5 block">Confirma parola noua</label>
              <input
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeta parola noua"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
              />
            </div>

            {/* Indicator putere parola */}
            {newPassword && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn("flex-1 h-1 rounded-full", {
                        "bg-red-400": newPassword.length >= 1 && i === 1,
                        "bg-orange-400": newPassword.length >= 4 && i === 2,
                        "bg-yellow-400": newPassword.length >= 6 && i === 3,
                        "bg-[#2D6A4F]": newPassword.length >= 8 && i === 4,
                        "bg-gray-200": !(
                          (newPassword.length >= 1 && i === 1) ||
                          (newPassword.length >= 4 && i === 2) ||
                          (newPassword.length >= 6 && i === 3) ||
                          (newPassword.length >= 8 && i === 4)
                        ),
                      })}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {newPassword.length < 4 ? "Parola slaba" : newPassword.length < 6 ? "Parola medie" : newPassword.length < 8 ? "Parola buna" : "Parola puternica"}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-[#E8F4EF] border border-[#a8d5bc] rounded-lg px-3 py-2 flex items-center gap-2">
                <Check size={14} className="text-[#2D6A4F]" />
                <p className="text-xs text-[#2D6A4F]">{success}</p>
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-[#2D6A4F] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Schimba parola"}
            </button>
          </div>
        </div>

        {/* 2FA */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Shield size={16} className="text-[#2D6A4F]" />
            <span className="text-sm font-medium text-gray-900">Autentificare in 2 pasi (2FA)</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">Adauga un nivel extra de securitate contului tau.</p>
            <div className="bg-[#FEF3C7] border border-yellow-200 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-[#92400e]">Functia 2FA va fi disponibila in curand.</p>
            </div>
            <button disabled className="w-full border border-gray-200 text-gray-400 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
              Activeaza 2FA
            </button>
          </div>
        </div>

        {/* STERGE CONT */}
        <div className="bg-white border border-red-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100">
            <span className="text-sm font-medium text-red-600">Zona periculoasa</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              Stergerea contului este permanenta si va sterge toate anunturile si datele tale.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Sterge contul meu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}