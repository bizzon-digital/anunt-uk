"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ZONE_UK = [
  "Londra", "Birmingham", "Manchester", "Leeds", "Sheffield",
  "Liverpool", "Bristol", "Leicester", "Slough", "Coventry",
  "Luton", "Nottingham", "Newcastle", "Bradford", "Cardiff",
];

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setUsername(data.username || "");
      setPhone(data.phone || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
    }
    setLoading(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingAvatar(true);

    const ext = file.name.split(".").pop();
    const fileName = `${userId}/avatar-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
      setAvatarUrl(urlData.publicUrl);
    }
    setUploadingAvatar(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username: username || null,
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", userId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* TOPBAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">Inapoi</span>
        </Link>
        <span className="text-sm font-medium text-gray-900">Editeaza profilul</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "text-sm font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1",
            saved ? "bg-[#E8F4EF] text-[#2D6A4F]" : "bg-[#2D6A4F] text-white"
          )}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Salvat</> : "Salveaza"}
        </button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">

        {/* AVATAR */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#2D6A4F] border-[3px] border-[#E36414] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-medium">
                  {fullName?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#E36414] rounded-full flex items-center justify-center border-2 border-white cursor-pointer">
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              {uploadingAvatar ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
            </label>
          </div>
          <p className="text-xs text-gray-400">Apasa pe camera pentru a schimba poza</p>
        </div>

        {/* DATE PERSONALE */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Date personale</span>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Nume complet <span className="text-[#E36414]">*</span></label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Numele tau complet"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Doar litere mici, cifre si underscore</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Numar de telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 000000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Locatie</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
              >
                <option value="">Selecteaza orasul</option>
                {ZONE_UK.map((zona) => (
                  <option key={zona} value={`${zona}, UK`}>{zona}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 flex justify-between">
                <span>Despre mine</span>
                <span className="text-gray-300">{bio.length} / 300</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Cateva cuvinte despre tine..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2] resize-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <><Check size={18} /> Salvat cu succes!</> : "Salveaza modificarile"}
        </button>
      </div>
    </div>
  );
}