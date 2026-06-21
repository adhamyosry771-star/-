import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Layers,
  Award,
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Bookmark,
  Check,
  Loader2,
  ChevronRight,
  Info,
  Copy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  Calendar,
  RotateCcw,
  Sparkles,
  Send,
  Phone,
  Settings,
  Battery,
  Wifi,
  BookmarkCheck
} from "lucide-react";
import { quranData } from "./data/quran";
import { athkarData } from "./data/athkar";
import { ChatMessage, Surah, Verse, AthkarCategory } from "./types";

// Egypt Cities Configuration with accurate localized prayer times and Qibla angles (pointing South-East @ ~135°-140°)
interface EgyptCityConfig {
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  qiblaAngle: number;
  prayerTimes: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

const EGYPT_CITIES: EgyptCityConfig[] = [
  {
    nameAr: "القاهرة",
    nameEn: "Cairo",
    latitude: 30.0444,
    longitude: 31.2357,
    qiblaAngle: 136,
    prayerTimes: { Fajr: "04:15", Sunrise: "05:55", Dhuhr: "12:58", Asr: "16:32", Maghrib: "20:01", Isha: "21:31" }
  },
  {
    nameAr: "الشرقية (الزقازيق)",
    nameEn: "Zagazig",
    latitude: 30.5877,
    longitude: 31.5020,
    qiblaAngle: 136,
    prayerTimes: { Fajr: "04:14", Sunrise: "05:54", Dhuhr: "12:57", Asr: "16:31", Maghrib: "20:00", Isha: "21:30" }
  },
  {
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    latitude: 31.2001,
    longitude: 29.9187,
    qiblaAngle: 138,
    prayerTimes: { Fajr: "04:19", Sunrise: "06:01", Dhuhr: "13:03", Asr: "16:39", Maghrib: "20:07", Isha: "21:39" }
  },
  {
    nameAr: "الدقهلية (المنصورة)",
    nameEn: "Mansoura",
    latitude: 31.0409,
    longitude: 31.3785,
    qiblaAngle: 137,
    prayerTimes: { Fajr: "04:14", Sunrise: "05:54", Dhuhr: "12:58", Asr: "16:32", Maghrib: "20:01", Isha: "21:31" }
  },
  {
    nameAr: "الغربية (طنطا)",
    nameEn: "Tanta",
    latitude: 30.7865,
    longitude: 31.0004,
    qiblaAngle: 137,
    prayerTimes: { Fajr: "04:16", Sunrise: "05:56", Dhuhr: "12:59", Asr: "16:34", Maghrib: "20:03", Isha: "21:33" }
  },
  {
    nameAr: "أسيوط",
    nameEn: "Asyut",
    latitude: 27.1783,
    longitude: 31.1859,
    qiblaAngle: 134,
    prayerTimes: { Fajr: "04:18", Sunrise: "05:53", Dhuhr: "12:59", Asr: "16:28", Maghrib: "19:58", Isha: "21:24" }
  },
  {
    nameAr: "الأقصر",
    nameEn: "Luxor",
    latitude: 25.6872,
    longitude: 32.6396,
    qiblaAngle: 133,
    prayerTimes: { Fajr: "04:19", Sunrise: "05:51", Dhuhr: "12:54", Asr: "16:21", Maghrib: "19:51", Isha: "21:16" }
  },
  {
    nameAr: "أسوان",
    nameEn: "Aswan",
    latitude: 24.0889,
    longitude: 32.8998,
    qiblaAngle: 132,
    prayerTimes: { Fajr: "04:22", Sunrise: "05:51", Dhuhr: "12:53", Asr: "16:17", Maghrib: "19:47", Isha: "21:11" }
  },
  {
    nameAr: "بور سعيد",
    nameEn: "Port Said",
    latitude: 31.2653,
    longitude: 32.3019,
    qiblaAngle: 136,
    prayerTimes: { Fajr: "04:10", Sunrise: "05:50", Dhuhr: "12:54", Asr: "16:29", Maghrib: "19:57", Isha: "21:28" }
  },
  {
    nameAr: "الجيزة",
    nameEn: "Giza",
    latitude: 30.0131,
    longitude: 31.2089,
    qiblaAngle: 136,
    prayerTimes: { Fajr: "04:16", Sunrise: "05:56", Dhuhr: "12:59", Asr: "16:33", Maghrib: "20:02", Isha: "21:32" }
  },
  {
    nameAr: "البحيرة (دمنهور)",
    nameEn: "Damanhour",
    latitude: 31.0379,
    longitude: 30.4688,
    qiblaAngle: 138,
    prayerTimes: { Fajr: "04:18", Sunrise: "05:59", Dhuhr: "13:02", Asr: "16:37", Maghrib: "20:06", Isha: "21:36" }
  },
  {
    nameAr: "المنيا",
    nameEn: "Minya",
    latitude: 28.0871,
    longitude: 30.7618,
    qiblaAngle: 135,
    prayerTimes: { Fajr: "04:19", Sunrise: "05:56", Dhuhr: "13:00", Asr: "16:31", Maghrib: "20:01", Isha: "21:29" }
  }
];

function convertTo12Hour(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h >= 12 ? "م" : "ص";
  return `${h12}:${m}${suffix}`;
}

function playWebAudioBeadSound(frequencyValue = 350, type: "bead" | "success" | "chime" = "bead") {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === "bead") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequencyValue, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.07);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.14);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch (err) {
    // Silently continue if audio context is blocked
  }
}

export default function App() {
  // Tabs: "home" | "quran" | "athkar" | "sebha" | "qibla"
  const [activeTab, setActiveTab] = useState<"home" | "quran" | "athkar" | "sebha" | "qibla">("home");

  // App settings & basic utilities
  const [selectedCity, setSelectedCity] = useState<EgyptCityConfig>(EGYPT_CITIES[0]); // Default: Cairo
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hijriDateStr, setHijriDateStr] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Egypt prayer tracking
  const [nextPrayerName, setNextPrayerName] = useState<string>("صلاة المغرب");
  const [nextPrayerTime, setNextPrayerTime] = useState<string>("20:01");
  const [countdownStr, setCountdownStr] = useState<string>("00:00:00");
  const [activePrayerTimes, setActivePrayerTimes] = useState<{
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  }>(EGYPT_CITIES[0].prayerTimes);
  const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState<boolean>(false);

  useEffect(() => {
    // Revert to fallback immediately when city changes
    setActivePrayerTimes(selectedCity.prayerTimes);

    const fetchLivePrayerTimes = async () => {
      setIsPrayerTimesLoading(true);
      try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        
        // Fetch using precise coordinates for perfect astronomical accuracy tailored to the specific governorate
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}&method=5&timezone=Africa/Cairo`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API network response failed");
        
        const json = await res.json();
        if (json.code === 200 && json.data && json.data.timings) {
          const t = json.data.timings;
          const cleanTime = (timeStr: string) => {
            if (!timeStr) return "";
            return timeStr.split(" ")[0];
          };

          setActivePrayerTimes({
            Fajr: cleanTime(t.Fajr) || selectedCity.prayerTimes.Fajr,
            Sunrise: cleanTime(t.Sunrise) || selectedCity.prayerTimes.Sunrise,
            Dhuhr: cleanTime(t.Dhuhr) || selectedCity.prayerTimes.Dhuhr,
            Asr: cleanTime(t.Asr) || selectedCity.prayerTimes.Asr,
            Maghrib: cleanTime(t.Maghrib) || selectedCity.prayerTimes.Maghrib,
            Isha: cleanTime(t.Isha) || selectedCity.prayerTimes.Isha
          });
        }
      } catch (err) {
        console.error("Live prayer times fetch failed: ", err);
      } finally {
        setIsPrayerTimesLoading(false);
      }
    };

    fetchLivePrayerTimes();
  }, [selectedCity.latitude, selectedCity.longitude]);

  // Quran panel state
  const [selectedSurah, setSelectedSurah] = useState<Surah>(quranData[0]); // Al-Fatihah
  const [isSurahLoading, setIsSurahLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSurahVerses = async () => {
      if (!selectedSurah || (selectedSurah.verses && selectedSurah.verses.length > 0)) {
        return;
      }

      setIsSurahLoading(true);
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/ar.simple`);
        if (!res.ok) throw new Error("Failed to fetch surah");
        const json = await res.json();

        let translations: string[] = [];
        try {
          const transRes = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.sahih`);
          if (transRes.ok) {
            const transJson = await transRes.json();
            translations = transJson.data.ayahs.map((a: any) => a.text);
          }
        } catch (eTrans) {
          console.error("Trans fetch err", eTrans);
        }

        if (json.code === 200 && json.data && json.data.ayahs) {
          const fetchedVerses = json.data.ayahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: translations[index] || ""
          }));

          setSelectedSurah(prev => {
            if (prev.number === selectedSurah.number) {
              return { ...prev, verses: fetchedVerses };
            }
            return prev;
          });

          const inData = quranData.find(q => q.number === selectedSurah.number);
          if (inData) {
            inData.verses = fetchedVerses;
          }
        }
      } catch (err) {
        showInstantTip("تعذر تحميل الآيات الكريمة حالياً، يرجى تكرار المحاولة.");
      } finally {
        setIsSurahLoading(false);
      }
    };

    fetchSurahVerses();
  }, [selectedSurah.number]);

  const [quranFontSize, setQuranFontSize] = useState<number>(23);
  const [quranSearch, setQuranSearch] = useState<string>("");
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<number | null>(null);
  const [verseTafsirContent, setVerseTafsirContent] = useState<string>("");
  const [isTafsirLoading, setIsTafsirLoading] = useState<boolean>(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("هدى_علامات_مصر");
      return saved ? JSON.parse(saved) : ["1-1", "67-12"];
    } catch {
      return ["1-1", "67-12"];
    }
  });

  // Athkar counter list state
  const [athkarList, setAthkarList] = useState<AthkarCategory[]>(() => {
    return JSON.parse(JSON.stringify(athkarData));
  });
  const [selectedAthkarCat, setSelectedAthkarCat] = useState<string>("sabah");

  // Sebha state
  const [tasbihPhrase, setTasbihPhrase] = useState<string>("سُبْحَانَ اللَّهِ");
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [sessionTotalTasbih, setSessionTotalTasbih] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("هدى_مسبحة_اجمالي_مصر") || "0");
    } catch {
      return 0;
    }
  });
  const [tasbihGoal, setTasbihGoal] = useState<number>(33);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "msg-1",
        role: "assistant",
        content: "مرحباً بك يا أخي الكريم في المستشار الإيماني الذكي. يسرني إجابتك على أي تساؤل روحي، تفسير آية، أو تذكيرك بالسنن النبوية النيرة.",
        timestamp: new Date()
      }
    ];
  });
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Notification notification bar (replaced sliding dynamic banner to respect "no flying sliding AI effects")
  const [systemTip, setSystemTip] = useState<string>("انقر على الأذكار لتخفيض عداد القراءة اليومي.");

  // Qibla Simulating dial
  const [userCompassHeading, setUserCompassHeading] = useState<number>(130);
  const wasAlignedRef = useRef<boolean>(false);

  const triggerSound = (type: "bead" | "success" | "chime") => {
    if (soundEnabled) {
      if (type === "bead") playWebAudioBeadSound(340 + Math.random() * 40, "bead");
      else playWebAudioBeadSound(440, type);
    }
  };

  const showInstantTip = (msg: string) => {
    setSystemTip(msg);
  };

  // Convert Gregorian Date to Islamic formatted date
  useEffect(() => {
    try {
      const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      setHijriDateStr(formatter.format(currentTime));
    } catch (e) {
      setHijriDateStr("١٤ رمضان ١٤٤٧ هـ");
    }
  }, [currentTime]);

  // Egyptian Prayer calculations
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const pt = activePrayerTimes;

      const timeToMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };

      const nowMinutes = currentHours * 60 + currentMinutes;

      const prayersOrdered = [
        { name: "الفجر", time: pt.Fajr },
        { name: "الشروق", time: pt.Sunrise },
        { name: "الظهر", time: pt.Dhuhr },
        { name: "العصر", time: pt.Asr },
        { name: "المغرب", time: pt.Maghrib },
        { name: "العشاء", time: pt.Isha }
      ];

      let next = prayersOrdered.find(p => timeToMinutes(p.time) > nowMinutes);
      if (!next) {
        next = prayersOrdered[0]; // Next Fajr
      }

      setNextPrayerName(next.name);
      setNextPrayerTime(next.time);

      let diffMinutes = timeToMinutes(next.time) - nowMinutes;
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }

      const diffSeconds = (diffMinutes * 60) - now.getSeconds();
      const h = Math.floor(diffSeconds / 3600);
      const m = Math.floor((diffSeconds % 3600) / 60);
      const s = Math.floor(diffSeconds % 60);

      const pad = (v: number) => String(v).padStart(2, "0");
      const toArabicDigits = (str: string) => {
        const ar = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return str.replace(/[0-9]/g, w => ar[+w]);
      };

      setCountdownStr(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activePrayerTimes, currentTime]);

  useEffect(() => {
    localStorage.setItem("هدى_مسبحة_اجمالي_مصر", String(sessionTotalTasbih));
  }, [sessionTotalTasbih]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  const cleanQuranText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\t/g, " ")
      .replace(/\r/g, "")
      .replace(/[\u06df-\u06ed]/g, "") // Remove Uthmani micro-signs causing boxes/squares
      .replace(/\u06dd/g, "")         // Remove special end-of-ayah marker from rendering directly
      .replace(/\u06de/g, "")         // Remove starting rub-el-hizb symbol
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeArabic = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/[\u064b-\u065f]/g, "") // Remove tashkeel (vowels/diacritics)
      .replace(/[أإآأ]/g, "ا")         // Normalize Alef
      .replace(/ة/g, "ه")              // Normalize Teh Marbuta
      .replace(/ى/g, "ي")              // Normalize Alef Maksura
      .trim();
  };

  const filteredSurahs = quranData.filter(s => {
    const qClean = normalizeArabic(quranSearch).toLowerCase();
    if (!qClean) return true;

    const nameClean = normalizeArabic(s.name);
    const englishClean = s.englishName.toLowerCase();

    // Custom helper checking if user searches for popular terms
    let matchingExtra = false;
    if (s.number === 112 && (qClean.includes("قل هو الله") || qClean.includes("الاخلاص") || qClean.includes("اخلص"))) matchingExtra = true;
    if (s.number === 113 && (qClean.includes("الفلق") || qClean.includes("قل اعوذ برب الفلق"))) matchingExtra = true;
    if (s.number === 114 && (qClean.includes("الناس") || qClean.includes("قل اعوذ برب الناس"))) matchingExtra = true;
    if (s.number === 1 && (qClean.includes("الفتحه") || qClean.includes("الحمد لله") || qClean.includes("ام الكتاب"))) matchingExtra = true;

    return nameClean.includes(qClean) || englishClean.includes(qClean) || matchingExtra;
  });

  const handleToggleBookmark = (surahNum: number, verseNum: number) => {
    const key = `${surahNum}-${verseNum}`;
    let updated;
    if (bookmarkedVerses.includes(key)) {
      updated = bookmarkedVerses.filter(v => v !== key);
      showInstantTip("تم إزالة الآية الكريمة من المحفوظات.");
    } else {
      updated = [...bookmarkedVerses, key];
      showInstantTip("حُفِظت الآية في علاماتك المرجعية للمراجعة الروحية.");
      triggerSound("chime");
    }
    setBookmarkedVerses(updated);
    localStorage.setItem("هدى_علامات_مصر", JSON.stringify(updated));
  };

  const handleFetchTafsir = async (verse: Verse, surah: Surah) => {
    if (activeTafsirVerse === verse.number && verseTafsirContent) {
      setActiveTafsirVerse(null);
      return;
    }

    setActiveTafsirVerse(verse.number);
    setIsTafsirLoading(true);
    setVerseTafsirContent("");

    try {
      const response = await fetch("/api/tafsir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseText: cleanQuranText(verse.text),
          surahName: surah.name,
          verseNumber: verse.number
        })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setVerseTafsirContent(data.tafsier || data.tafsir || "أكمل عقل المفسر بياناً واثقاً.");
      triggerSound("chime");
    } catch {
      setVerseTafsirContent("أنت تقرأ تفسير الآية من خادم طريق الهدى المؤقت: هذه آية جليلة تبث الهداية والسكينة في قلوب المؤمنين وتحمل عبراً بالغة الأثر.");
    } finally {
      setIsTafsirLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    triggerSound("bead");

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      triggerSound("success");
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `a-err-${Date.now()}`,
        role: "assistant",
        content: "نحن هنا في طريق الهدى نرحب بك دائماً. طابت بالذكر والقرآن ليلتك وأثابك الباري مغفرة وسلاماً.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSebhaClick = () => {
    triggerSound("bead");
    setTasbihCount(prev => {
      const next = prev + 1;
      if (next >= tasbihGoal) {
        triggerSound("success");
        setSessionTotalTasbih(total => total + tasbihGoal);
        showInstantTip(`تقبل الله! أتممت الورد لـ: "${tasbihPhrase}"`);
        return 0;
      }
      return next;
    });
  };

  const handleAthkarItemClick = (categoryId: string, itemId: string) => {
    setAthkarList(prev => {
      return prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item => {
              if (item.id === itemId) {
                if (item.currentCount >= item.count) {
                  triggerSound("chime");
                  return { ...item, currentCount: 0 };
                }
                const nextCount = item.currentCount + 1;
                if (nextCount === item.count) {
                  triggerSound("success");
                  showInstantTip("تمت تلاوة هذا الذكر المبارك بالكامل!");
                } else {
                  triggerSound("bead");
                }
                return { ...item, currentCount: nextCount };
              }
              return item;
            })
          };
        }
        return cat;
      });
    });
  };

  const resetCategoryCounter = (categoryId: string) => {
    triggerSound("chime");
    setAthkarList(prev => {
      return prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(i => ({ ...i, currentCount: 0 }))
          };
        }
        return cat;
      });
    });
    showInstantTip("أعيد عداد هذه المجموعة إلى الصفر.");
  };

  const copyStaticText = (text: string) => {
    navigator.clipboard.writeText(text);
    showInstantTip("تم نسخ النص العذب للمشاركة بنجاح!");
    triggerSound("success");
  };

  // Egypt Qibla dial mathematics
  const targetQiblaAngle = selectedCity.qiblaAngle;
  const relativeQiblaRotation = (userCompassHeading - targetQiblaAngle + 360) % 360;
  const isAligned = Math.abs(relativeQiblaRotation) < 5 || Math.abs(relativeQiblaRotation - 360) < 5;

  // Trigger gentle audio/vibration feedback on alignment
  useEffect(() => {
    if (isAligned && activeTab === "qibla") {
      if (!wasAlignedRef.current) {
        triggerSound("success");
        if (navigator.vibrate) {
          try {
            navigator.vibrate(200);
          } catch (e) {
            // Silently swallow state errors
          }
        }
        wasAlignedRef.current = true;
      }
    } else {
      wasAlignedRef.current = false;
    }
  }, [isAligned, activeTab]);

  return (
    <div className="min-h-screen bg-[#F1EFE9] md:py-6 flex flex-col items-center justify-center font-kufi">
      
      {/* Standard Clean Responsive Web Application Container */}
      <div className="w-full max-w-3xl bg-[#FDFBF7] text-[#2D3436] flex flex-col md:rounded-3xl md:shadow-lg md:border md:border-gray-200/60 relative overflow-hidden h-screen md:h-[850px]">
        
        {/* App Interior Navbar */}
        <header className="bg-[#1E4D2B] text-white px-5 py-4 shadow-md">
          <div className="flex justify-between items-center gap-3">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div 
                className="w-10 h-10 bg-[#C5A059] text-[#1E4D2B] rounded-xl flex items-center justify-center cursor-pointer active:rotate-12 transition-transform overflow-hidden shrink-0"
                onClick={() => { setActiveTab("home"); triggerSound("chime"); }}
              >
                <img 
                  src="https://d.top4top.io/p_3823jpd1h0.png" 
                  alt="لوجو التطبيق" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-black tracking-wide leading-none select-none text-white">طريق الهدى</h1>
                <span className="text-[10px] text-[#C5A059] font-medium block mt-1 select-none">تطبيق المسلم المصري</span>
              </div>
            </div>

            {/* Localizer Settings & Audio Switch */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  triggerSound("chime");
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="تأثيرات الصوت"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#C5A059]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white/40" />
                )}
              </button>

              <div className="bg-white/5 border border-[#C5A059]/25 hover:bg-white/10 transition-colors rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <select
                  value={selectedCity.nameAr}
                  onChange={(e) => {
                    const city = EGYPT_CITIES.find(c => c.nameAr === e.target.value);
                    if (city) {
                      setSelectedCity(city);
                      showInstantTip(`مواقيت الصلاة حسب محافظة ${city.nameAr}`);
                      triggerSound("chime");
                    }
                  }}
                  className="bg-transparent font-bold text-xs text-[#C5A059] border-none focus:outline-none appearance-none cursor-pointer pr-1 w-auto max-w-[150px] sm:max-w-none text-right"
                >
                  {EGYPT_CITIES.map(c => (
                    <option key={c.nameAr} className="text-[#1E4D2B] bg-[#FDFBF7]" value={c.nameAr}>{c.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-white/70 font-semibold bg-black/10 rounded-xl px-2.5 py-1.5">
            <span className="text-[#C5A059]">{hijriDateStr}</span>
            <span>{selectedCity.nameAr} • مصر</span>
          </div>
        </header>



        {/* Mobile View Container Screen Body (With custom styled non-distracting elements) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#FDFBF7] islamic-pattern">
          
          {/* ================= TAB: HOME ================= */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-4 select-none">
              
              {/* Stable Next Prayer Display Box */}
              <div className="bg-[#1E4D2B] text-white p-5 rounded-[24px] border border-[#C5A059] relative overflow-hidden">

                <span className="text-[#C5A059] text-[10px] font-bold tracking-widest block uppercase">الصلاة القادمة في {selectedCity.nameAr}</span>
                <div className="mt-2 pb-1">
                  <p className="text-white/90 text-sm">بقي على {nextPrayerName === "الشروق" ? "موعد" : "موعد أذان"} <span className="font-bold text-[#C5A059]">{nextPrayerName}</span>: <span className="font-mono text-[#C5A059] font-bold tracking-wider">{countdownStr}</span></p>
                </div>

                {/* Grid of basic Egyptian prayer hours */}
                <div className="grid grid-cols-6 gap-1 border-t border-white/10 pt-3.5 mt-3.5 text-center">
                  {[
                    { label: "الفجر", val: activePrayerTimes.Fajr },
                    { label: "الشروق", val: activePrayerTimes.Sunrise },
                    { label: "الظهر", val: activePrayerTimes.Dhuhr },
                    { label: "العصر", val: activePrayerTimes.Asr },
                    { label: "المغرب", val: activePrayerTimes.Maghrib },
                    { label: "العشاء", val: activePrayerTimes.Isha },
                  ].map((item, id) => {
                    const isNext = item.label === nextPrayerName;
                    return (
                      <div key={id} className={`p-1 rounded-lg ${isNext ? "bg-[#C5A059] text-[#1E4D2B] font-bold" : "text-white/70"}`}>
                        <div className="text-[9px] whitespace-nowrap leading-none mb-1 text-center">{item.label}</div>
                        <div className="text-[10px] sm:text-xs font-bold font-mono tracking-tighter text-center whitespace-nowrap">{convertTo12Hour(item.val)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verses & Custom Islamic Quote For Comfort (No dynamic animations, pure cozy text block) */}
              <div className="p-4 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="bg-[#1E4D2B] text-[#C5A059] px-2.5 py-0.5 rounded-full text-[10px] font-bold">آية اليوم والتدبر</span>
                  <button 
                    onClick={() => copyStaticText(`"وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنْفُسِكُمْ مِنْ خَيْرٍ تَجِدُوهُ عِنْدَ اللَّهِ"`)}
                    className="p-1 rounded hover:bg-[#F4EDE2] text-[#1E4D2B]"
                    title="نسخ الآية الكريمة"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-amiri text-lg text-amber-950 font-bold leading-normal text-right mt-2 my-1">
                  "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنْفُسِكُمْ مِنْ خَيْرٍ تَجِدُوهُ عِنْدَ اللَّهِ ۗ إِنَّ اللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌ" (البقرة - ١١٠)
                </p>
                <p className="text-[11px] text-gray-500 mt-2 font-medium leading-normal border-t border-gray-200/50 pt-2 text-right">
                  الدروس الروحية: تحثنا الآية على المداومة الراسخة على بناء الصلوات الخمس والعمل الطيب فإنه رصيدنا المذخور عند الباري عز وجل.
                </p>
              </div>

              {/* Simple Navigation Buttons Grid inside Home screen */}
              <div className="grid grid-cols-2 gap-3.5">
                
                <button
                  onClick={() => { setActiveTab("quran"); triggerSound("chime"); }}
                  className="bg-white p-4 rounded-xl border border-[#C5A059]/25 hover:border-[#1E4D2B] transition-colors text-right flex flex-col gap-1 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E4D2B]/5 flex items-center justify-center text-lg text-[#1E4D2B]">📖</div>
                  <span className="font-bold text-xs text-[#1E4D2B] mt-2">القرآن الكريم والتفسير</span>
                  <span className="text-[9px] text-gray-400">تلاوة متكاملة وشرح رصين</span>
                </button>

                <button
                  onClick={() => { setActiveTab("athkar"); triggerSound("chime"); }}
                  className="bg-white p-4 rounded-xl border border-[#C5A059]/25 hover:border-[#1E4D2B] transition-colors text-right flex flex-col gap-1 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E4D2B]/5 flex items-center justify-center text-lg text-[#1E4D2B]">☀️</div>
                  <span className="font-bold text-xs text-[#1E4D2B] mt-2">أذكار الصباح والمساء</span>
                  <span className="text-[9px] text-gray-400">حصن نفسك بالأذكار والسنن</span>
                </button>

                <button
                  onClick={() => { setActiveTab("sebha"); triggerSound("chime"); }}
                  className="bg-white p-4 rounded-xl border border-[#C5A059]/25 hover:border-[#1E4D2B] transition-colors text-right flex flex-col gap-1 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E4D2B]/5 flex items-center justify-center text-lg text-[#C5A059]">📿</div>
                  <span className="font-bold text-xs text-[#1E4D2B] mt-2">المسبحة الإلكترونية</span>
                  <span className="text-[9px] text-gray-400">تابع تسبيحك ووردك اليومي</span>
                </button>

                <button
                  onClick={() => { setActiveTab("qibla"); triggerSound("chime"); }}
                  className="bg-white p-4 rounded-xl border border-[#C5A059]/25 hover:border-[#1E4D2B] transition-colors text-right flex flex-col gap-1 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E4D2B]/5 flex items-center justify-center text-lg text-[#1E4D2B]">🧭</div>
                  <span className="font-bold text-xs text-[#1E4D2B] mt-2">اتصال القبلة والبوصلة</span>
                  <span className="text-[9px] text-gray-400">دليل دقيق يوجهك لمكة</span>
                </button>

              </div>

              {/* Special Egyptian Mosques & Historical Landmarks Info Card */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-[10px] bg-[#1E4D2B]/10 text-[#1E4D2B] px-2 py-0.5 rounded-full font-bold">نفحات إسلامية مصرية</span>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  مصر بلد الألف مئذنة، من الأزهر الشريف وجامع عمرو بن العاص إلى مسجد الفتاح العليم، تمسك بقرآنك وتلاوتك واجعل السكينة تعمر ثنايا قلبك الليلة.
                </p>
              </div>

              {/* Designer & Developer Credit */}
              <div className="text-center mt-3 mb-1 select-none">
                <span className="text-xs text-gray-400 font-medium block">
                  تم تصميم وتطوير التطبيق بواسطة المهندس أدهم
                </span>
              </div>

            </div>
          )}

          {/* ================= TAB: QURAN ================= */}
          {activeTab === "quran" && (
            <div className="flex flex-col gap-4 text-right">
              
              {/* Search Surah Options */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#C5A059] absolute top-3 right-3" />
                <input
                  type="text"
                  value={quranSearch}
                  onChange={(e) => setQuranSearch(e.target.value)}
                  placeholder="ابحث عن السورة (الفاتحة، الملك، الكهف)..."
                  className="w-full bg-[#F4EDE2]/40 text-xs text-[#1E4D2B] font-bold border border-[#C5A059]/40 rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>

              {/* Surahs Scroll Tab (Horizonal navigation without fly effects) */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {filteredSurahs.map((surah) => {
                  const isCur = selectedSurah.number === surah.number;
                  return (
                    <button
                      key={surah.number}
                      onClick={() => {
                        setSelectedSurah(surah);
                        setActiveTafsirVerse(null);
                        setVerseTafsirContent("");
                        triggerSound("chime");
                      }}
                      className={`px-3 py-2 text-xs rounded-xl font-bold whitespace-nowrap border ${
                        isCur
                          ? "bg-[#1E4D2B] text-white border-[#1E4D2B]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#C5A059]"
                      }`}
                    >
                      {surah.name}
                    </button>
                  );
                })}
              </div>

              {/* Quran Bookmarked Toggles */}
              <div className="bg-[#FCD757]/10 p-3 rounded-xl border border-[#C5A059]/30 text-xs">
                <div className="flex items-center gap-1.5 text-[#1E4D2B] font-bold">
                  <Bookmark className="w-3.5 h-3.5 fill-current text-[#C5A059]" />
                  <span>العلامات المرجعية المحفوظة:</span>
                </div>
                {bookmarkedVerses.length === 0 ? (
                  <p className="text-gray-400 text-[10px] mt-1.5">لا توجد آيات محفوظة حالياً. المس علامة العلم بجانب الآيات لحفظها.</p>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bookmarkedVerses.map(key => {
                      const [sId, vId] = key.split("-").map(Number);
                      const sName = quranData.find(q => q.number === sId)?.name || `سورة ${sId}`;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            const foundS = quranData.find(q => q.number === sId);
                            if (foundS) {
                              setSelectedSurah(foundS);
                              triggerSound("chime");
                              showInstantTip(`انتقلت إلى آية ${vId} من سورة ${foundS.name}`);
                            }
                          }}
                          className="bg-white border border-[#C5A059]/30 text-[10px] font-bold text-[#1E4D2B] px-2 py-1 rounded"
                        >
                          {sName} • آية {vId}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reader Board */}
              <div className="bg-white rounded-2xl border border-[#C5A059]/30 p-4 shadow-sm flex flex-col gap-4">
                
                {/* Header Surah Title */}
                <div className="text-center pb-4 border-b border-gray-100 bg-[#1E4D2B]/5 rounded-xl pt-2">
                  <span className="text-[10px] text-gray-400 font-bold block">سورة {selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} آيات</span>
                  <h3 className="font-amiri text-2xl font-black text-[#1E4D2B] mt-1">{selectedSurah.name}</h3>
                  {selectedSurah.number !== 1 && (
                    <p className="font-amiri text-sm text-amber-900 mt-2 font-bold select-none text-center">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  )}
                </div>

                {/* Verses Container */}
                <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {isSurahLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-[#1E4D2B]">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mb-3" />
                      <p className="font-sans text-xs text-gray-500 font-bold">جاري تحميل آيات سورة {selectedSurah.name} الكريمة...</p>
                      <span className="text-[10px] text-gray-400 mt-1">نسعى لتوفير المصحف كاملاً بجودة عالية</span>
                    </div>
                  ) : (selectedSurah.verses && selectedSurah.verses.length > 0) ? (
                    selectedSurah.verses.map((verse) => {
                      const isFav = bookmarkedVerses.includes(`${selectedSurah.number}-${verse.number}`);
                      const isTaf = activeTafsirVerse === verse.number;

                      return (
                        <div
                          key={verse.number}
                          className={`p-3 rounded-xl border ${
                            isTaf ? "bg-[#1E4D2B]/5 border-[#C5A059]" : "bg-transparent border-gray-100 hover:bg-[#F4EDE2]/10"
                          }`}
                        >
                          {/* Upper Verse Actions Bar */}
                          <div className="flex justify-between items-center text-xs mb-2 text-gray-400">
                            <span className="bg-gray-100 text-gray-600 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{verse.number}</span>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleBookmark(selectedSurah.number, verse.number)}
                                className={`p-1 rounded ${isFav ? "text-[#C5A059] bg-amber-50" : "text-gray-300 hover:text-[#C5A059]"}`}
                              >
                                <Bookmark className="w-3.5 h-3.5 fill-current" />
                              </button>

                              <button
                                onClick={() => handleFetchTafsir(verse, selectedSurah)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${isTaf ? "bg-[#C5A059] text-[#1E4D2B]" : "bg-[#1E4D2B]/10 text-[#1E4D2B]"}`}
                              >
                                التدبر والبيان
                              </button>

                              <button
                                onClick={() => copyStaticText(`﴿${cleanQuranText(verse.text)}﴾ [${selectedSurah.name} - آية ${verse.number}]`)}
                                className="p-1 text-gray-300 hover:text-[#1E4D2B]"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Arabic text */}
                          <p
                            className="font-amiri text-right tracking-wide leading-relaxed text-[#1E4D2B] font-semibold my-2 text-justify"
                            style={{ fontSize: `${quranFontSize}px` }}
                          >
                            {cleanQuranText(verse.text)}
                          </p>

                          {/* Traditional translations */}
                          {verse.translation && (
                            <p className="text-[11px] text-gray-400 border-r-2 border-amber-300 pr-2 mt-1 py-0.5" dir="ltr">
                              {verse.translation}
                            </p>
                          )}

                          {/* Inplace static Tafsir block */}
                          {isTaf && (
                            <div className="mt-3 p-3 rounded-lg bg-[#F4EDE2]/50 border border-[#C5A059]/40 text-xs">
                              <span className="font-bold text-[#1E4D2B] block">تفسير وتأمل الآية:</span>
                              {isTafsirLoading ? (
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-2">
                                  <Loader2 className="w-3 h-3 animate-spin text-[#C5A059]" />
                                  <span>يجري استخلاص التفسير الروحي...</span>
                                </div>
                              ) : (
                                <p className="text-gray-700 mt-1.5 leading-relaxed font-sans">{verseTafsirContent}</p>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      لا توجد آيات متوفرة لهذه السورة الكريمة حالياً.
                    </div>
                  )}
                </div>

                {/* Adjust Font Sizes Panel */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                  <span className="text-gray-400">حجم الخط:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setQuranFontSize(Math.max(quranFontSize-2, 16)); triggerSound("bead"); }} className="w-6 h-6 bg-gray-100 rounded text-gray-600 font-bold">-</button>
                    <span className="font-bold">{quranFontSize}px</span>
                    <button onClick={() => { setQuranFontSize(Math.min(quranFontSize+2, 34)); triggerSound("bead"); }} className="w-6 h-6 bg-gray-100 rounded text-gray-600 font-bold">+</button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB: ATHKAR ================= */}
          {activeTab === "athkar" && (
            <div className="flex flex-col gap-4 text-right select-none">
              
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "sabah", label: "أذكار الصباح", icon: "☀️" },
                  { id: "masaa", label: "أذكار المساء", icon: "🌙" },
                  { id: "salah", label: "بعد الصلاة", icon: "🕌" },
                  { id: "nawm", label: "أذكار النوم", icon: "💤" },
                ].map(cat => {
                  const isSel = selectedAthkarCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedAthkarCat(cat.id); triggerSound("chime"); }}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        isSel
                          ? "bg-[#1E4D2B] text-white border-[#1E4D2B]"
                          : "bg-white text-gray-600 border-[#C5A059]/30 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500 font-semibold">تكرار الأذكار بالضغط على البطاقة:</span>
                <button
                  onClick={() => resetCategoryCounter(selectedAthkarCat)}
                  className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>تصفير المجموعة</span>
                </button>
              </div>

              {/* Athkar Checklist Card List */}
              <div className="flex flex-col gap-3">
                {athkarList.find(c => c.id === selectedAthkarCat)?.items.map(item => {
                  const isDone = item.currentCount >= item.count;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleAthkarItemClick(selectedAthkarCat, item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isDone
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-white border-[#C5A059]/30 hover:border-[#1E4D2B]"
                      }`}
                    >
                      {/* Counter Badge */}
                      <div className="absolute top-3 left-3 text-xs bg-[#1E4D2B]/5 text-[#1E4D2B] px-2 py-1 rounded-full font-bold">
                        {isDone ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">✓ تم الورد</span>
                        ) : (
                          <span>كرر: {item.currentCount} / {item.count}</span>
                        )}
                      </div>

                      <p className="font-amiri text-base text-[#1E4D2B] tracking-wide leading-relaxed pl-20 my-1 font-bold">
                        {item.text}
                      </p>

                      {item.description && (
                        <p className="text-[10px] text-gray-400 mt-2 font-medium bg-[#F4EDE2]/30 p-2 rounded border border-[#C5A059]/10">
                          {item.description}
                        </p>
                      )}

                      {item.reference && (
                        <span className="text-[9px] text-gray-400 float-left mt-2 block font-normal">{item.reference}</span>
                      )}
                      
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================= TAB: SEBHA ================= */}
          {activeTab === "sebha" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4 text-center select-none font-kufi">
              
              <div>
                <span className="bg-[#1E4D2B] text-white px-3 py-1 rounded-full text-[10px] font-bold">المسبحة الإلكترونية المصرية</span>
                <p className="text-gray-500 text-[10px] mt-1.5">انقر على المستطيل الدائري الكبير لزيادة حبات تسبيحك</p>
              </div>

              {/* Fast phrase picker */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
                {[
                  "سُبْحَانَ اللَّهِ",
                  "الْحَمْدُ لِلَّهِ",
                  "اللَّهُ أَكْبَرُ",
                  "أَسْتَغْفِرُ اللَّهَ",
                  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
                  "اللَّهُمَّ صَلِّ عَلَى مُحَمَّد"
                ].map(ph => {
                  const isCur = tasbihPhrase === ph;
                  return (
                    <button
                      key={ph}
                      onClick={() => {
                        setTasbihPhrase(ph);
                        setTasbihCount(0);
                        triggerSound("chime");
                      }}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${
                        isCur ? "bg-[#C5A059] text-[#1E4D2B] border-[#C5A059]" : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {ph}
                    </button>
                  );
                })}
              </div>

              {/* Bead controller layout (no fly animations, clean counter update) */}
              <div className="flex flex-col items-center gap-3 w-full">
                
                {/* Current sessions cumulative */}
                <div className="text-[10px] text-[#1E4D2B] font-bold bg-[#F4EDE2]/70 px-4 py-1 rounded-full border border-[#C5A059]/30">
                  مجموع الأوراد بالجلسة الحالية: <span className="font-mono text-xs">{sessionTotalTasbih}</span>
                </div>

                {/* Simulated bead clicker */}
                <button
                  onClick={handleSebhaClick}
                  className="w-44 h-44 rounded-full bg-gradient-to-br from-[#1E4D2B] to-[#11311b] border-4 border-[#C5A059] flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all text-white relative focus:outline-none"
                >
                  <span className="text-[10px] text-[#C5A059] opacity-70">انقر هنا للتسبيح</span>
                  <span className="text-4xl font-mono font-black my-1">{tasbihCount}</span>
                  <span className="text-[10px] text-white/80 font-bold truncate max-w-[130px]">{tasbihPhrase}</span>
                  
                  {/* Goal label indicator inside circle */}
                  <span className="absolute bottom-2.5 text-[9px] text-[#C5A059]/80 font-semibold">المستهدف: {tasbihGoal}</span>
                </button>

                {/* Adjust Goal & Reset */}
                <div className="flex items-center gap-3.5 mt-2">
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs">
                    <span className="text-gray-400 font-bold">الإنهاء عند:</span>
                    {[33, 99, 100].map(goalVal => {
                      const isG = tasbihGoal === goalVal;
                      return (
                        <button
                          key={goalVal}
                          onClick={() => { setTasbihGoal(goalVal); setTasbihCount(0); triggerSound("chime"); }}
                          className={`px-2 py-0.5 rounded font-black ${isG ? "bg-[#1E4D2B] text-white" : "bg-transparent text-gray-600"}`}
                        >
                          {goalVal}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { setTasbihCount(0); triggerSound("chime"); }}
                    className="p-1 px-2 text-[10px] bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg border border-red-200"
                  >
                    إعادة صفر
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB: QIBLA ================= */}
          {activeTab === "qibla" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center py-4 select-none font-kufi">
              
              <div>
                <span className="bg-[#1E4D2B] text-white px-3 py-1 rounded-full text-[10px] font-bold">تحديد اتجاه القبلة</span>
                <p className="text-gray-500 text-[10px] mt-1.5">متركزة لمحافظة {selectedCity.nameAr}</p>
              </div>

              {/* Compass simulator container */}
              <div className="relative w-48 h-48 rounded-full border-4 border-[#C5A059] bg-[#1E4D2B]/5 flex items-center justify-center p-2 shadow-inner">
                
                {/* Compass Dial aligned to relative angle */}
                <div
                  className="w-full h-full rounded-full relative transition-transform duration-300"
                  style={{ transform: `rotate(${-userCompassHeading}deg)` }}
                >
                  {/* North marker */}
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-rose-600 font-black text-xs font-mono">N</span>
                  {/* East marker */}
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 font-black text-[9px] font-mono">E</span>
                  {/* South marker */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-500 font-black text-[9px] font-mono">S</span>
                  {/* West marker */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 font-black text-[9px] font-mono">W</span>

                  {/* Qibla Angle Needle Pointer (Targeting Mecca around 135°-138° in Egypt) */}
                  <div
                    className="absolute w-1.5 h-1/2 bg-[#C5A059] origin-bottom bottom-1/2 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${targetQiblaAngle}deg)` }}
                  >
                    {/* Tiny Kaaba Dome Representation top */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-base">🕋</div>
                  </div>
                </div>

                {/* Inner alignment confirmator bulb */}
                <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs shadow ${isAligned ? "bg-emerald-500 text-white" : "bg-white text-gray-400"}`}>
                  {isAligned ? "✓" : "⚙"}
                </div>

              </div>

              {/* Slider simulation for user to manually adjust the heading on screen (مريح للعين وتفاعلي كأنك تلف الهاتف) */}
              <div className="w-full max-w-xs bg-gray-50 border border-gray-250 p-4 rounded-xl text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-650 block">موازنة الاتجاه الجغرافي:</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={userCompassHeading}
                  onChange={(e) => {
                    const nextHeading = Number(e.target.value);
                    setUserCompassHeading(nextHeading);
                  }}
                  className="w-full mt-2 cursor-pointer accent-[#1E4D2B]"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 font-mono">
                  <span>زاوية الهاتف الحالية: {userCompassHeading}°</span>
                  <span className="text-[#1E4D2B] font-bold">زاوية القبلة لمحافظتك: {targetQiblaAngle}°</span>
                </div>

                {isAligned ? (
                  <p className="text-[11px] text-emerald-700 font-bold leading-normal mt-2.5 text-center">
                    ✓ الهاتف موجه بدقة فائقة نحو مكة المكرمة والكعبة الشريفة الآن.
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-700 font-medium leading-normal mt-2.5 text-center">
                    حرك شريط الموازنة بالأعلى لمحاكاة محاذاة البوصلة للحصول على التوجيه السليم.
                  </p>
                )}
              </div>

            </div>
          )}



        </div>

        {/* Stable and Comfortable Bottom App Navigation Bar */}
        <footer className="bg-white border-t border-gray-200 px-3 py-2 flex justify-around items-center select-none shadow-md z-15">
          
          <button
            onClick={() => { setActiveTab("home"); triggerSound("chime"); }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === "home" ? "text-[#1E4D2B] font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-[9px]">الرئيسية</span>
          </button>

          <button
            onClick={() => { setActiveTab("quran"); triggerSound("chime"); }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === "quran" ? "text-[#1E4D2B] font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-1" />
            <span className="text-[9px]">المصحف</span>
          </button>

          <button
            onClick={() => { setActiveTab("athkar"); triggerSound("chime"); }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === "athkar" ? "text-[#1E4D2B] font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Layers className="w-5 h-5 mb-1" />
            <span className="text-[9px]">الأذكار</span>
          </button>

          <button
            onClick={() => { setActiveTab("sebha"); triggerSound("chime"); }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === "sebha" ? "text-[#1E4D2B] font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Award className="w-5 h-5 mb-1" />
            <span className="text-[9px]">المسبحة</span>
          </button>

          <button
            onClick={() => { setActiveTab("qibla"); triggerSound("chime"); }}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              activeTab === "qibla" ? "text-[#1E4D2B] font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Compass className="w-5 h-5 mb-1" />
            <span className="text-[9px]">القبلة</span>
          </button>

        </footer>

      </div>

    </div>
  );
}
