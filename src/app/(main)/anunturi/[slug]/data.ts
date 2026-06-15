import { Home, Car, Wrench } from "lucide-react";

export const ANUNT_DEMO = {
  id: "1",
  title: "Cameră de închiriat, East Ham — bills inclus",
  slug: "camera-east-ham",
  description: `Cameră mobilată într-o casă curată și bine întreținută, situată în East Ham, la 5 minute de stația de metrou.

Bills incluse: gaz, curent, apă, internet fibră 100MB. Acces la bucătărie complet echipată și baie comună.

Condiții:
- Numai pentru profesioniști sau studenți
- Fără fumători în casă
- Fără animale de companie
- Referințe necesare

Disponibil din 1 iulie. Minimum 3 luni. Depozit echivalent cu 2 săptămâni.`,
  category: "chirie",
  categoryLabel: "Chirie",
  price: 120,
  priceUnit: "săpt.",
  billsIncluded: true,
  location: "East Ham, Londra",
  postcode: "E6 2JB",
  time: "acum 2 ore",
  views: 47,
  saves: 8,
  promoted: true,
  listingId: "UK-A4X2K",
  images: 4,
  whatsapp: "+447700900123",
  phone: "+447700900123",
};

export const USER_DEMO = {
  id: "u1",
  name: "Mihai Ionescu",
  initials: "MI",
  location: "Londra, UK",
  memberSince: "mai 2024",
  isVerified: true,
  isPremium: true,
  rating: 4.2,
  reviewCount: 18,
  listingsCount: 23,
  responseRate: 94,
  ratingBreakdown: [12, 3, 2, 1, 0],
};

export const ALTE_ANUNTURI = [
  { id: "2", title: "Ford Focus 2019", price: "£9,500", icon: Car, slug: "ford-focus" },
  { id: "3", title: "Cameră Ilford", price: "£110/săpt.", icon: Home, slug: "camera-ilford" },
  { id: "4", title: "Renovări interior", price: "La cerere", icon: Wrench, slug: "renovari" },
];