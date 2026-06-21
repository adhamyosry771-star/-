export interface Verse {
  number: number;
  text: string;
  translation?: string;
  tafsir?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelationType: "Meccan" | "Medinan" | "مكية" | "مدنية";
  numberOfAyahs: number;
  verses: Verse[];
}

export interface AthkarItem {
  id: string;
  text: string;
  count: number;
  currentCount: number;
  description?: string;
  reference?: string;
}

export interface AthkarCategory {
  id: string;
  name: string;
  icon: string;
  items: AthkarItem[];
}

export interface PrayerTime {
  id: string;
  name: string;
  nameEn: string;
  time: string; // HH:MM
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  method: "auto" | "manual";
}
