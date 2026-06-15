"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nume, setNume] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email sau parola incorecta. Incearca din nou.");
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    if (password.length < 6) {
      setError("Parola trebuie sa aiba minim 6 caractere.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nume } },
    });
    if (error) {
      setError("A aparut o eroare. Incearca din nou.");
    } else {
      setSuccess("Cont creat! Verifica emailul pentru confirmare.");
    }
    setLoading(false);
  }

  async function handleForgot() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) {
      setError("A aparut o eroare. Verifica adresa de email.");
    } else {
      setSuccess("Email trimis! Verifica inbox-ul pentru resetarea parolei.");
    }
    setLoading(false);
  }

  async function handleFacebook() {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }
async function handleGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}
  function handleSubmit() {
    if (mode === "login") handleLogin();
    else if (mode === "register") handleRegister();
    else handleForgot();
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* HEADER */}
      <div className="bg-[#2D6A4F] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-[#FAF7F2]">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <Link href="/" className="flex items-center">
          <span className="text-[#FAF7F2] font-serif text-xl font-medium">Anunturi</span>
          <span className="text-[#E36414] font-serif text-xl font-medium">.uk</span>
        </Link>
        <div className="w-16" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* CARD */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

            {/* TABS login/register */}
            {mode !== "forgot" && (
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className={cn(
                    "flex-1 py-3.5 text-sm font-medium transition-colors",
                    mode === "login" ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  Intra in cont
                </button>
                <button
                  onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                  className={cn(
                    "flex-1 py-3.5 text-sm font-medium transition-colors",
                    mode === "register" ? "bg-[#2D6A4F] text-white" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  Cont nou
                </button>
              </div>
            )}

            <div className="p-6">
              {mode === "forgot" && (
                <div className="mb-5">
                  <button
                    onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                    className="flex items-center gap-1 text-sm text-gray-500 mb-3"
                  >
                    <ArrowLeft size={16} /> Inapoi la login
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Resetare parola</h2>
                  <p className="text-sm text-gray-400 mt-1">Iti trimitem un email cu instructiuni.</p>
                </div>
              )}

              {/* FACEBOOK */}
              {mode !== "forgot" && (
                <button
                  onClick={handleFacebook}
                  className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-3 rounded-xl text-sm font-medium mb-4 hover:bg-blue-600 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continua cu Facebook
                </button>
              )}
{mode !== "forgot" && (
  <button
    onClick={handleGoogle}
    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium mb-4 hover:bg-gray-50 transition-colors"
  >
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Continua cu Google
  </button>
)}
              {mode !== "forgot" && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">sau cu email</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}

              {/* FORM */}
              <div className="flex flex-col gap-3">
                  <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Adresa de email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Parola"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {mode === "login" && (
                  <button
                    onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                    className="text-xs text-[#2D6A4F] text-right font-medium"
                  >
                    Ai uitat parola?
                  </button>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-[#E8F4EF] border border-[#a8d5bc] rounded-lg px-3 py-2">
                    <p className="text-xs text-[#2D6A4F]">{success}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !email || (mode !== "forgot" && !password)}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-1",
                    loading || !email || (mode !== "forgot" && !password)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#2D6A4F] text-white hover:bg-green-800"
                  )}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {mode === "login" ? "Intra in cont" : mode === "register" ? "Creeaza cont" : "Trimite email"}
                </button>
              </div>

              {mode === "register" && (
                <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                  Prin crearea contului esti de acord cu{" "}
                  <Link href="/termeni" className="text-[#2D6A4F] underline">Termenii</Link>
                  {" "}si{" "}
                  <Link href="/confidentialitate" className="text-[#2D6A4F] underline">Politica de confidentialitate</Link>.
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Anunturi.uk — Comunitatea romanilor din UK
          </p>
        </div>
      </div>
    </div>
  );
}