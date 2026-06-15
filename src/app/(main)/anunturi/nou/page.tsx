"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Camera, Plus, X, Home, Briefcase, Car, Wrench,
  ShoppingBag, Calendar, Heart, MoreHorizontal, MapPin, Phone,
  MessageCircle, Rocket, Check, Sparkles, ChevronDown, Info,
  Loader2, Briefcase as BriefcaseIcon, Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STEPS = ["Categorie", "Detalii", "Contact", "Promovare"];

const CATEGORII = [
  { id: "chirie", label: "Chirie", icon: Home, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "joburi", label: "Joburi", icon: Briefcase, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "servicii", label: "Servicii", icon: Wrench, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "masini", label: "Masini", icon: Car, color: "text-[#2D6A4F]", bg: "bg-[#E8F4EF]" },
  { id: "vand-cumpar", label: "Vand / Cumpar", icon: ShoppingBag, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "evenimente", label: "Evenimente", icon: Calendar, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "matrimoniale", label: "Matrimoniale", icon: Heart, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
  { id: "diverse", label: "Diverse", icon: MoreHorizontal, color: "text-[#E36414]", bg: "bg-[#FFF0E6]" },
];

const SUBCATEGORII: Record<string, string[]> = {
  chirie: ["Camera", "Garsoniera", "Apartament", "Casa", "Loc in camera", "Birou"],
  joburi: ["Ofer loc de munca", "Caut loc de munca"],
  masini: ["Autoturism", "SUV", "Van / Utilitara", "Motocicleta", "Camion", "Altele"],
  servicii: ["Constructii & Renovari", "Curatenie", "Transport & Mutari", "IT & Web", "Contabilitate & Juridic", "Sanatate & Beauty", "Meditatii & Cursuri", "Altele"],
  "vand-cumpar": ["Electronice", "Mobila & Casa", "Haine & Accesorii", "Sport & Fitness", "Carti & Muzica", "Copii & Jucarii", "Altele"],
  evenimente: ["Concert & Festival", "Petrecere & Nunta", "Sport", "Cultural & Educatie", "Religios", "Altele"],
  matrimoniale: ["Barbat cauta Femeie", "Femeie cauta Barbat", "Prietenie & Socializare", "Altele"],
  diverse: ["Animale de companie", "Pierdut & Gasit", "Voluntariat", "Altele"],
};

const PLACEHOLDER_CONFIG: Record<string, {
  titluPlaceholder: string;
  titluHint: string;
  descrierePlaceholder: string;
  showPret: boolean;
  pretLabel: string;
  showBills: boolean;
  showTipJob: boolean;
  pretUnits: string[];
  pretOptional: boolean;
}> = {
  chirie: {
    titluPlaceholder: "ex: Camera mobilata, East Ham - bills inclus",
    titluHint: "Include locatia si detalii cheie pentru mai multe vizualizari",
    descrierePlaceholder: "Descrie proprietatea: mobila, facilitati, reguli casa, disponibilitate...",
    showPret: true, pretLabel: "Chiria", showBills: true, showTipJob: false,
    pretUnits: ["saptamana", "luna"], pretOptional: false,
  },
  joburi: {
    titluPlaceholder: "ex: Caut sofer curierat Londra / Ofer post contabil",
    titluHint: "Specifica daca oferi sau cauti loc de munca",
    descrierePlaceholder: "Descrie jobul sau experienta ta: responsabilitati, cerinte, program de lucru, beneficii...",
    showPret: true, pretLabel: "Salariu (optional)", showBills: false, showTipJob: true,
    pretUnits: ["ora", "zi", "luna", "an"], pretOptional: true,
  },
  servicii: {
    titluPlaceholder: "ex: Constructor si renovari interioare - preturi corecte",
    titluHint: "Descrie serviciul tau pe scurt si zona de acoperire",
    descrierePlaceholder: "Descrie serviciile oferite, experienta, zona de activitate, preturi orientative...",
    showPret: true, pretLabel: "Pret de la (optional)", showBills: false, showTipJob: false,
    pretUnits: ["ora", "zi", "total"], pretOptional: true,
  },
  masini: {
    titluPlaceholder: "ex: Ford Focus 2019, 1.5 diesel, 89.000 km",
    titluHint: "Include marca, modelul, anul si detalii importante",
    descrierePlaceholder: "Descrie masina: istoric service, defecte, dotari, motive vanzare...",
    showPret: true, pretLabel: "Pret", showBills: false, showTipJob: false,
    pretUnits: ["total"], pretOptional: false,
  },
  "vand-cumpar": {
    titluPlaceholder: "ex: iPhone 14 Pro 256GB Space Black, ca nou",
    titluHint: "Include starea produsului si detalii relevante",
    descrierePlaceholder: "Descrie produsul: stare, defecte, accesorii incluse, motive vanzare...",
    showPret: true, pretLabel: "Pret", showBills: false, showTipJob: false,
    pretUnits: ["total"], pretOptional: false,
  },
  evenimente: {
    titluPlaceholder: "ex: Concert Maria Gheorghiu - Londra, 15 Iulie",
    titluHint: "Include data si locul evenimentului",
    descrierePlaceholder: "Descrie evenimentul: program, adresa exacta, pret bilete, cum se achizitioneaza...",
    showPret: true, pretLabel: "Pret bilet (daca exista)", showBills: false, showTipJob: false,
    pretUnits: ["total"], pretOptional: true,
  },
  matrimoniale: {
    titluPlaceholder: "ex: Barbat 35 ani, Londra, cauta relatie serioasa",
    titluHint: "Fii direct si sincer in descriere",
    descrierePlaceholder: "Prezinta-te: varsta, ocupatie, interese, ce cauti intr-o relatie...",
    showPret: false, pretLabel: "", showBills: false, showTipJob: false,
    pretUnits: [], pretOptional: true,
  },
  diverse: {
    titluPlaceholder: "ex: Catel pierdut zona Ilford / Ofer ajutor voluntar",
    titluHint: "Fii specific si include zona",
    descrierePlaceholder: "Descrie cat mai detaliat situatia...",
    showPret: false, pretLabel: "", showBills: false, showTipJob: false,
    pretUnits: ["total"], pretOptional: true,
  },
};

const PROMO_PLANS = [
  {
    id: "free",
    name: "Gratuit",
    color: "text-[#2D6A4F]",
    desc: "Listare standard in categorie",
    details: ["Vizibil in lista generala", "Fara prioritate", "Valabil 30 zile"],
    icon: Check,
    iconBg: "bg-[#E8F4EF]",
    iconColor: "text-[#2D6A4F]",
  },
  {
    id: "basic",
    name: "Basic",
    color: "text-[#92400e]",
    desc: "Vizibilitate sporita in categorie",
    details: ["Sus in categoria ta", "Evidentiata vizual", "Reimprospatat automat"],
    icon: Rocket,
    iconBg: "bg-[#FEF3C7]",
    iconColor: "text-[#92400e]",
  },
  {
    id: "pro",
    name: "Pro",
    color: "text-red-600",
    desc: "Pozitie premium + notificari",
    details: ["TOP pagina principala", "Ribbon portocaliu Promovat", "Notificare la abonati zonei", "Reimprospatat la 3 zile"],
    icon: Rocket,
    iconBg: "bg-[#FEE8E8]",
    iconColor: "text-red-600",
    popular: true,
  },
  {
    id: "top",
    name: "Top Plus",
    color: "text-white",
    desc: "Vizibilitate maxima",
    details: ["Pozitie #1 in categorie", "Banner dedicat in pagina categoriei", "Push notification catre toti utilizatorii din zona", "Reimprospatat zilnic"],
    icon: Rocket,
    iconBg: "bg-[#E36414]",
    iconColor: "text-white",
  },
];

const DURATE: Record<string, string[]> = {
  basic: ["7 zile", "14 zile", "30 zile", "60 zile"],
  pro:   ["7 zile", "14 zile", "30 zile", "60 zile"],
  top:   ["7 zile", "14 zile", "30 zile", "60 zile"],
};

const DURATE_ZILE: Record<string, number> = {
  "7 zile": 7, "14 zile": 14, "30 zile": 30, "60 zile": 60,
};

const PRET_MATRICE: Record<string, Record<string, number>> = {
  basic: { "7 zile": 1.99, "14 zile": 2.99, "30 zile": 4.99, "60 zile": 7.99 },
  pro:   { "7 zile": 3.99, "14 zile": 5.99, "30 zile": 9.99, "60 zile": 15.99 },
  top:   { "7 zile": 6.99, "14 zile": 9.99, "30 zile": 18.99, "60 zile": 29.99 },
};

async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
    };
    img.src = url;
  });
}

export default function AdaugaAnuntPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [categorie, setCategorie] = useState("");
  const [subcategorie, setSubcategorie] = useState("");
  const [tipJob, setTipJob] = useState<"ofer" | "caut" | "">("");
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const [pret, setPret] = useState("");
  const [pretUnit, setPretUnit] = useState("total");
  const [pretTip, setPretTip] = useState("fix");
  const [billsIncluse, setBillsIncluse] = useState<string | null>(null);
  const [locatie, setLocatie] = useState("");
  const [postcode, setPostcode] = useState("");
  const [afisareLocatie, setAfisareLocatie] = useState("zona");
  const [telefon, setTelefon] = useState("");
  const [contactWA, setContactWA] = useState(true);
  const [contactPhone, setContactPhone] = useState(true);
  const [contactMsg, setContactMsg] = useState(true);
  const [promoPlan, setPromoPlan] = useState("free");
  const [promoDurata, setPromoDurata] = useState("30 zile");
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiSugestie, setAiSugestie] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [showPromoDetails, setShowPromoDetails] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);

  const config = PLACEHOLDER_CONFIG[categorie] || PLACEHOLDER_CONFIG["diverse"];
  const planSelectat = PROMO_PLANS.find((p) => p.id === promoPlan);
  const isPaidPlan = promoPlan !== "free";
  const totalPlata = isPaidPlan ? (PRET_MATRICE[promoPlan]?.[promoDurata] || 0) : 0;
  const needsPhoto = isPaidPlan && photos.length === 0;

  useEffect(() => {
  async function fetchCredits() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();
    if (data) setUserCredits(data.credits || 0);
  }
  fetchCredits();
}, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photos.length >= 10) { alert("Maxim 10 fotografii permise."); return; }
    setUploadingPhotos(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const newUrls: string[] = [];
    for (const file of Array.from(files).slice(0, 10 - photos.length)) {
      try {
        const compressed = await compressImage(file);
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { data, error } = await supabase.storage
          .from("listing-images")
          .upload(fileName, compressed, { contentType: "image/jpeg", upsert: false });
        if (!error && data) {
          const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(data.path);
          newUrls.push(urlData.publicUrl);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    setPhotos((prev) => [...prev, ...newUrls]);
    setUploadingPhotos(false);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function genereazaAI() {
    if (!titlu || !categorie) return;
    setLoadingAi(true);
    await new Promise((r) => setTimeout(r, 1000));
    const suggestions: Record<string, string> = {
      chirie: `${titlu} - disponibil imediat, zona linistita`,
      joburi: tipJob === "ofer" ? `${titlu} - angajam urgent, salariu atractiv` : `${titlu} - experienta relevanta, disponibil imediat`,
      masini: `${titlu} - stare excelenta, history full`,
      servicii: `${titlu} - experienta 10+ ani, garantie`,
      "vand-cumpar": `${titlu} - stare impecabila, negociabil`,
      evenimente: `${titlu} - nu rata!`,
      matrimoniale: titlu,
      diverse: titlu,
    };
    setAiSugestie(suggestions[categorie] || titlu);
    setLoadingAi(false);
  }

  async function handlePublish() {
    if (needsPhoto) {
      alert("Anunturile platite necesita cel putin o fotografie.");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titlu,
          description: descriere,
          category: categorie,
          subcategory: subcategorie || null,
          price: config.showPret && pret ? pret : null,
          price_unit: pretUnit,
          price_type: pretTip,
          bills_included: billsIncluse === "da" ? true : billsIncluse === "nu" ? false : null,
          location: locatie,
          postcode,
          show_exact_location: afisareLocatie === "exact",
          images: photos,
          phone: telefon,
          contact_methods: [
            ...(contactWA ? ["whatsapp"] : []),
            ...(contactPhone ? ["phone"] : []),
            ...(contactMsg ? ["message"] : []),
          ],
          whatsapp: contactWA ? telefon : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) { alert(data.error || "A aparut o eroare."); return; }

      // Daca e plan platit, redirecteaza la plata
      if (isPaidPlan && data.listing) {
        const checkoutRes = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "promotion",
            amount: totalPlata,
            listingId: data.listing.id,
            promoPlan,
            promoDays: DURATE_ZILE[promoDurata],
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      router.push("/profile");
    } catch (err) {
      alert("A aparut o eroare. Incearca din nou.");
    } finally {
      setLoading(false);
    }
  }

  function canProceed() {
    if (step === 0) return categorie !== "" && subcategorie !== "";
    if (step === 1) {
      const basicOk = titlu.length > 5 && descriere.length > 10 && locatie.length > 2;
      const pretOk = config.pretOptional || !config.showPret || pret !== "";
      const jobOk = categorie !== "joburi" || tipJob !== "";
      return basicOk && pretOk && jobOk;
    }
    if (step === 2) {
      return telefon.length >= 10 && (contactWA || contactPhone || contactMsg);
    }
    return true;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* TOPBAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-20">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.push("/")} className="flex items-center gap-1 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm">{step > 0 ? "Inapoi" : "Anulare"}</span>
        </button>
        <span className="text-sm font-medium text-gray-900">Adauga anunt</span>
        <button className="text-xs text-[#2D6A4F] font-medium border border-[#2D6A4F] px-3 py-1 rounded-full">
          Ciorna
        </button>
      </div>

      {/* PROGRESS */}
      <div className="bg-[#2D6A4F] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div className={cn("absolute top-3 left-1/2 w-full h-0.5 z-0", i < step ? "bg-white/60" : "bg-white/20")} />
              )}
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium relative z-10", i < step ? "bg-[#E36414] text-white" : i === step ? "bg-white text-[#2D6A4F]" : "bg-white/20 text-white/60")}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={cn("text-[10px] mt-1", i === step ? "text-white" : "text-white/60")}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">

        {/* STEP 0 — CATEGORIE */}
        {step === 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Alege categoria</h2>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {CATEGORII.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategorie(cat.id); setSubcategorie(""); setTipJob(""); }}
                    className={cn("flex flex-col items-center gap-2 bg-white border rounded-xl py-4 px-2 transition-all", categorie === cat.id ? "border-[#2D6A4F] bg-[#E8F4EF] shadow-sm" : "border-gray-100 hover:border-gray-200")}
                  >
                    <div className={cn("p-2.5 rounded-xl", cat.bg)}>
                      <Icon size={22} className={cat.color} />
                    </div>
                    <span className="text-[11px] text-gray-600 text-center leading-tight font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {categorie === "joburi" && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Tip anunt job <span className="text-[#E36414]">*</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setTipJob("ofer"); setSubcategorie("Ofer loc de munca"); }}
                    className={cn("flex items-center gap-3 border rounded-xl p-4 transition-all", tipJob === "ofer" ? "border-[#2D6A4F] bg-[#E8F4EF]" : "border-gray-100 hover:border-gray-200 bg-white")}
                  >
                    <div className="w-10 h-10 bg-[#E8F4EF] rounded-xl flex items-center justify-center flex-shrink-0">
                      <BriefcaseIcon size={20} className="text-[#2D6A4F]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Ofer job</p>
                      <p className="text-xs text-gray-400">Angajator</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setTipJob("caut"); setSubcategorie("Caut loc de munca"); }}
                    className={cn("flex items-center gap-3 border rounded-xl p-4 transition-all", tipJob === "caut" ? "border-[#2D6A4F] bg-[#E8F4EF]" : "border-gray-100 hover:border-gray-200 bg-white")}
                  >
                    <div className="w-10 h-10 bg-[#E8F4EF] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Search size={20} className="text-[#2D6A4F]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Caut job</p>
                      <p className="text-xs text-gray-400">Candidat</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {categorie && categorie !== "joburi" && SUBCATEGORII[categorie] && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Subcategorie <span className="text-[#E36414]">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {SUBCATEGORII[categorie].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSubcategorie(sub)}
                      className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", subcategorie === sub ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 — DETALII */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* FOTO */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-[#2D6A4F]" />
                  <span className="text-sm font-medium text-gray-900">Fotografii <span className="text-gray-400 font-normal">(max. 10)</span></span>
                </div>
                {isPaidPlan && <span className="text-xs text-[#E36414] font-medium">Obligatorie pentru plan platit</span>}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  <label className={cn("col-span-2 row-span-2 border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden", photos[0] ? "border-transparent" : "border-[#2D6A4F] bg-[#E8F4EF] hover:bg-[#d4eee0]")}>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                    {uploadingPhotos ? (
                      <Loader2 size={28} className="text-[#2D6A4F] animate-spin" />
                    ) : photos[0] ? (
                      <div className="relative w-full h-full">
                        <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                        <button onClick={(e) => { e.preventDefault(); removePhoto(0); }} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera size={28} className="text-[#2D6A4F]" />
                        <span className="text-xs text-[#2D6A4F] font-medium text-center leading-tight px-2">Foto principala</span>
                      </>
                    )}
                  </label>
                  {[1, 2, 3, 4].map((i) => (
                    <label key={i} className={cn("border border-dashed rounded-xl h-14 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors overflow-hidden", photos[i] ? "border-transparent" : "border-gray-200 bg-gray-50 hover:bg-gray-100")}>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      {photos[i] ? (
                        <div className="relative w-full h-full">
                          <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                          <button onClick={(e) => { e.preventDefault(); removePhoto(i); }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Plus size={16} className="text-gray-300" />
                          <span className="text-[9px] text-gray-300">Foto {i + 1}</span>
                        </>
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Pozele sunt comprimate automat · Prima foto = coperta</p>
                {photos.length > 0 && photos.length < 10 && (
                  <label className="mt-2 flex items-center justify-center gap-2 text-xs text-[#2D6A4F] font-medium cursor-pointer">
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                    <Plus size={14} /> Adauga mai multe poze ({photos.length}/10)
                  </label>
                )}
              </div>
            </div>

            {/* TITLU + DESCRIERE */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">Detalii anunt</span>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Titlu <span className="text-[#E36414]">*</span></label>
                  <input
                    type="text"
                    value={titlu}
                    onChange={(e) => setTitlu(e.target.value)}
                    placeholder={config.titluPlaceholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{config.titluHint}</p>
                  {titlu.length > 3 && (
                    <div className="mt-2 bg-gradient-to-r from-[#E8F4EF] to-[#F0EBE3] border border-[#a8d5bc] rounded-lg p-3 flex items-start gap-2">
                      <Sparkles size={16} className="text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                      {aiSugestie ? (
                        <div className="flex-1">
                          <p className="text-xs text-[#2D6A4F] leading-relaxed">{aiSugestie}</p>
                          <button onClick={() => { setTitlu(aiSugestie); setAiSugestie(""); }} className="mt-1 text-[10px] bg-[#2D6A4F] text-white px-2 py-0.5 rounded">Foloseste</button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <p className="text-xs text-[#2D6A4F]">AI poate optimiza titlul tau</p>
                          <button onClick={genereazaAI} disabled={loadingAi} className="text-[10px] bg-[#2D6A4F] text-white px-2 py-1 rounded flex items-center gap-1">
                            {loadingAi ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Optimizeaza
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 flex justify-between">
                    <span>Descriere <span className="text-[#E36414]">*</span></span>
                    <span className="text-gray-300">{descriere.length} / 2000</span>
                  </label>
                  <textarea
                    value={descriere}
                    onChange={(e) => setDescriere(e.target.value)}
                    placeholder={config.descrierePlaceholder}
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PRET */}
            {config.showPret && (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-900">
                    {config.pretLabel}
                    {config.pretOptional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
                    {!config.pretOptional && <span className="text-[#E36414] ml-1">*</span>}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {categorie !== "matrimoniale" && (
                    <div className="flex gap-2">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 flex-shrink-0">£</div>
                      <input
                        type="number"
                        value={pret}
                        onChange={(e) => setPret(e.target.value)}
                        placeholder={config.pretOptional ? "Negociabil / La cerere" : "0"}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                      />
                      {config.pretUnits.length > 1 && (
                        <div className="relative">
                          <select
                            value={pretUnit}
                            onChange={(e) => setPretUnit(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none pr-7"
                          >
                            {config.pretUnits.map((u) => (
                              <option key={u} value={u}>
                                / {u === "saptamana" ? "săpt." : u === "luna" ? "lună" : u === "an" ? "an" : u === "ora" ? "oră" : u === "zi" ? "zi" : u}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  )}
                  {categorie !== "evenimente" && categorie !== "matrimoniale" && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Tip pret</label>
                      <div className="flex gap-2 flex-wrap">
                        {["fix", "negociabil", "la_cerere", "gratuit"].map((tip) => (
                          <button
                            key={tip}
                            onClick={() => setPretTip(tip)}
                            className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", pretTip === tip ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}
                          >
                            {tip === "la_cerere" ? "La cerere" : tip.charAt(0).toUpperCase() + tip.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {config.showBills && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Bills incluse?</label>
                      <div className="flex gap-2">
                        {[{ id: "da", label: "Da, incluse" }, { id: "nu", label: "Nu, separate" }, { id: "partial", label: "Partial" }].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setBillsIncluse(opt.id)}
                            className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", billsIncluse === opt.id ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOCATIE */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-[#2D6A4F]" />
                <span className="text-sm font-medium text-gray-900">Locatie</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Oras / Zona <span className="text-[#E36414]">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locatie}
                      onChange={(e) => setLocatie(e.target.value)}
                      placeholder="ex: East Ham, Londra"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                    />
                    <button
                      onClick={() => {
                        if (!navigator.geolocation) return;
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                            const data = await res.json();
                            const city = data.address?.city || data.address?.town || data.address?.village || "";
                            const pc = data.address?.postcode || "";
                            if (city) setLocatie(city + ", UK");
                            if (pc) setPostcode(pc.split(" ")[0]);
                          } catch {}
                        });
                      }}
                      className="flex items-center gap-1.5 bg-[#E8F4EF] border border-[#a8d5bc] text-[#2D6A4F] text-xs font-medium px-3 py-2 rounded-lg flex-shrink-0"
                    >
                      <MapPin size={14} /> GPS
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Cod postal</label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="ex: E6 1AA"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Afiseaza locatia?</label>
                  <div className="flex gap-2">
                    {[{ id: "zona", label: "Doar zona (recomandat)" }, { id: "exact", label: "Da, exact" }].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAfisareLocatie(opt.id)}
                        className={cn("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors", afisareLocatie === opt.id ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" : "bg-white text-gray-600 border-gray-200")}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — CONTACT */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Phone size={16} className="text-[#2D6A4F]" />
                <span className="text-sm font-medium text-gray-900">Numar de telefon <span className="text-[#E36414]">*</span></span>
              </div>
              <div className="p-4">
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+44 7700 000000"
                  className={cn("w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-[#FAF7F2]", telefon.length > 0 && telefon.length < 10 ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#2D6A4F]")}
                />
                {telefon.length > 0 && telefon.length < 10 && (
                  <p className="text-xs text-red-500 mt-1">Introduceti un numar valid</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Folosit pentru WhatsApp si apeluri directe</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">Metode de contact afisate</span>
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {[
                  { id: "wa", label: "WhatsApp", sub: telefon || "+44 7700 000000", icon: MessageCircle, iconColor: "text-[#25D366]", value: contactWA, setter: setContactWA },
                  { id: "phone", label: "Telefon", sub: "Afiseaza numarul pe anunt", icon: Phone, iconColor: "text-gray-700", value: contactPhone, setter: setContactPhone },
                  { id: "msg", label: "Mesaj intern", sub: "Prin platforma Anunturi.uk", icon: MessageCircle, iconColor: "text-[#2D6A4F]", value: contactMsg, setter: setContactMsg },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className={cn("flex items-center gap-3 px-4 py-3.5", item.value && "bg-[#E8F4EF]/30")}>
                      <Icon size={22} className={item.iconColor} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={cn("w-10 h-6 rounded-full relative transition-colors flex-shrink-0", item.value ? "bg-[#2D6A4F]" : "bg-gray-200")}
                      >
                        <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all", item.value ? "left-[18px]" : "left-0.5")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FFF8F0] border border-[#f5d9b8] rounded-xl p-4 flex gap-2">
              <Info size={16} className="text-[#E36414] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#7c5c3a] leading-relaxed">
                Numarul tau este vizibil doar utilizatorilor autentificati pentru a preveni spam-ul.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 — PROMOVARE */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Promovare anunt</h2>
            <p className="text-xs text-gray-400 mb-4">Alege un pachet pentru mai multa vizibilitate</p>

            <div className="flex flex-col gap-3 mb-5">
              {PROMO_PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = promoPlan === plan.id;
                const showDetails = showPromoDetails === plan.id;
                return (
                  <div key={plan.id} className={cn("bg-white border rounded-xl overflow-hidden transition-all", isSelected ? "border-[#E36414] border-[1.5px]" : "border-gray-100")}>
                    <button
                      onClick={() => setPromoPlan(plan.id)}
                      className={cn("w-full flex items-center gap-3 p-4 text-left", isSelected && "bg-[#FFF8F3]")}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", plan.iconBg)}>
                        <Icon size={20} className={plan.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                          {plan.popular && <span className="text-[10px] bg-[#E36414] text-white px-2 py-0.5 rounded-full font-medium">Popular</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          {plan.id === "free" ? (
                            <span className="text-sm font-bold text-[#2D6A4F]">Gratuit</span>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">
                              de la £{PRET_MATRICE[plan.id]?.["7 zile"]?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-[#E36414]" : "border-gray-300")}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-[#E36414] rounded-full" />}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowPromoDetails(showDetails ? null : plan.id)}
                      className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#2D6A4F] border-t border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      {showDetails ? "Ascunde detalii" : "Vezi ce include"}
                      <ChevronDown size={12} className={cn("transition-transform", showDetails && "rotate-180")} />
                    </button>
                    {showDetails && (
                      <div className="px-4 pb-3 bg-gray-50">
                        <ul className="flex flex-col gap-1.5 pt-2">
                          {plan.details.map((detail) => (
                            <li key={detail} className="flex items-center gap-2 text-xs text-gray-600">
                              <Check size={12} className="text-[#2D6A4F] flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DURATA CU PRETURI */}
            {isPaidPlan && DURATE[promoPlan] && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-900 mb-1">Durata promovare</p>
                <p className="text-xs text-gray-400 mb-3">Pretul variaza in functie de durata aleasa</p>
                <div className="grid grid-cols-2 gap-2">
                  {DURATE[promoPlan].map((d) => {
                    const pret = PRET_MATRICE[promoPlan]?.[d];
                    const isSelected = promoDurata === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setPromoDurata(d)}
                        className={cn(
                          "border rounded-xl p-3 text-left transition-all relative",
                          isSelected ? "border-[#E36414] bg-[#FFF8F3]" : "border-gray-100 hover:border-gray-200 bg-white"
                        )}
                      >
                        {d === "30 zile" && (
                          <span className="absolute -top-2 left-2 text-[10px] bg-[#2D6A4F] text-white px-2 py-0.5 rounded-full">
                            Recomandat
                          </span>
                        )}
                        <p className="text-sm font-semibold text-gray-900">{d}</p>
                        <p className={cn("text-base font-bold mt-0.5", isSelected ? "text-[#E36414]" : "text-gray-700")}>
                          £{pret?.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          £{((pret || 0) / DURATE_ZILE[d]).toFixed(2)}/zi
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {needsPhoto && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex gap-2">
                <Info size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Fotografie obligatorie</p>
                  <p className="text-xs text-red-600 mt-0.5">Anunturile platite trebuie sa contina cel putin o fotografie.</p>
                  <button onClick={() => setStep(1)} className="mt-2 text-xs text-red-600 underline">Mergi la Detalii →</button>
                </div>
              </div>
            )}

            {/* TOTAL */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Publicare anunt</span>
                <span className="text-[#2D6A4F] font-medium">Gratuit</span>
              </div>
              {isPaidPlan && (
  <p className={cn("text-xs mt-1 text-right", userCredits >= totalPlata ? "text-[#2D6A4F]" : "text-red-500")}>
    Sold cont: £{userCredits.toFixed(2)} {userCredits >= totalPlata ? "— suficient ✓" : "— insuficient ✗"}
  </p>
)}
              <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span className="text-[#E36414]">£{totalPlata.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGARE */}
        <div className="mt-6 flex flex-col gap-2">
          {step < 3 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className={cn("w-full py-3.5 rounded-xl text-sm font-semibold transition-colors", canProceed() ? "bg-[#2D6A4F] text-white hover:bg-green-800" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
            >
              Continua
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading || needsPhoto}
              className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Se publica..." : isPaidPlan ? `Publica si plateste £${totalPlata.toFixed(2)}` : "Publica anuntul gratuit"}
            </button>
          )}
          {step === 3 && (
            <p className="text-xs text-gray-400 text-center">
              Anuntul va fi verificat in max. 2 ore.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}