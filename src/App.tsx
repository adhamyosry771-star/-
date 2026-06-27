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
  BookmarkCheck,
  Home,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  CloudSun,
  Bell,
  Menu
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
  const suffix = h >= 12 ? " PM" : " AM";
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
  const [isMushafFullScreen, setIsMushafFullScreen] = useState<boolean>(false);
  const [isFullScreenBtnVisible, setIsFullScreenBtnVisible] = useState<boolean>(true);
  const [quranSearch, setQuranSearch] = useState<string>("");
  const [showSurahDrawer, setShowSurahDrawer] = useState<boolean>(false);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);

  useEffect(() => {
    setSelectedVerseNum(null);
  }, [selectedSurah.number]);

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
    <div 
      className="min-h-screen md:py-6 flex flex-col items-center justify-center font-kufi bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.top4top.io/p_3828dax2u0.jpg')" }}
    >
      
      {/* Standard Clean Responsive Web Application Container */}
      <div 
        className="w-full max-w-3xl text-white flex flex-col md:rounded-3xl md:shadow-lg md:border border-white/10 relative overflow-hidden h-[100dvh] md:h-[850px] transition-all duration-300 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.top4top.io/p_3828dax2u0.jpg')" }}
      >
        
        {/* App Interior Navbar */}
        <header className="px-5 py-4 bg-black/60 text-white shadow-md">
          <div className="flex justify-between items-center gap-3">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:rotate-12 transition-all overflow-hidden shrink-0 bg-white/5 border border-white/10"
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
                className="p-2 rounded-lg transition-colors bg-white/5 hover:bg-white/10 text-white"
                title="تأثيرات الصوت"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#C5A059]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white/40" />
                )}
              </button>

              <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs">
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
                    <option key={c.nameAr} className="text-xs text-white bg-[#09101C]" value={c.nameAr}>{c.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] font-semibold rounded-xl px-2.5 py-1.5 bg-white/5 text-white/70 border border-white/5">
            <span className="text-[#C5A059]">{hijriDateStr}</span>
            <span>{selectedCity.nameAr} • مصر</span>
          </div>
        </header>



        {/* Mobile View Container Screen Body (With custom styled non-distracting elements) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/35 backdrop-blur-[1px] relative">
          
          {/* ================= TAB: HOME ================= */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-4 select-none pb-2">
              
              {/* Elegant Transparent Next Prayer Section */}
              <div className="relative w-full py-7 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#0F1C2E]/60 border border-white/10 shadow-xl">
                
                {/* Content text */}
                <div className="relative z-10 text-center flex flex-col items-center justify-center">
                  <span className="text-emerald-400 text-[10px] font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                    {nextPrayerName === "الشروق" ? "موعد الشروق" : `صلاة ${nextPrayerName}`}
                  </span>
                  
                  <h2 className="text-4xl font-semibold tracking-widest text-white mt-3 select-all">
                    {(() => {
                      const timeStr = 
                        nextPrayerName === "الفجر" ? activePrayerTimes.Fajr :
                        nextPrayerName === "الشروق" ? activePrayerTimes.Sunrise :
                        nextPrayerName === "الظهر" ? activePrayerTimes.Dhuhr :
                        nextPrayerName === "العصر" ? activePrayerTimes.Asr :
                        nextPrayerName === "المغرب" ? activePrayerTimes.Maghrib :
                        nextPrayerName === "العشاء" ? activePrayerTimes.Isha : "";
                      if (!timeStr) return "";
                      const parts = timeStr.split(":");
                      if (parts.length < 2) return timeStr;
                      const h = parseInt(parts[0], 10);
                      const m = parts[1];
                      if (isNaN(h)) return timeStr;
                      const h12 = h % 12 === 0 ? 12 : h % 12;
                      const suffix = h >= 12 ? "PM" : "AM";
                      return (
                        <span className="inline-flex items-baseline font-mono">
                          <span>{h12}:{m}</span>
                          <span className="text-[13px] font-normal text-white/70 ml-1 select-none tracking-normal">{suffix}</span>
                        </span>
                      );
                    })()}
                  </h2>

                  <div className="mt-4 inline-flex items-center gap-1.5 bg-black/25 rounded-full px-3.5 py-1 border border-white/5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-white/80 font-medium text-[11px]">
                      بقي {nextPrayerName === "الشروق" ? "على موعد" : "على أذان"}: <span className="font-mono text-emerald-400 font-black tracking-wider bg-black/35 px-1.5 py-0.5 rounded ml-1">{countdownStr}</span>
                    </p>
                  </div>

                  {/* Elegant Gregorian Date (e.g. الجمعة 26 يونيو) */}
                  <span className="text-[11px] text-white/50 mt-2.5 font-bold font-sans tracking-wide">
                    {(() => {
                      try {
                        return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        }).format(currentTime).replace("،", "");
                      } catch (e) {
                        return "";
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Prayer Times Stack Container (Perfect single-column list of horizontal rectangle strips for full mobile viewability) */}
              <div className="bg-[#0F1C2E]/60 rounded-3xl border border-white/10 p-3.5 shadow-xl flex flex-col gap-2.5">
                {[
                  { label: "الفجر", val: activePrayerTimes.Fajr, icon: <Sunrise className="w-4 h-4" /> },
                  { label: "الشروق", val: activePrayerTimes.Sunrise, icon: <CloudSun className="w-4 h-4" /> },
                  { label: "الظهر", val: activePrayerTimes.Dhuhr, icon: <Sun className="w-4 h-4" /> },
                  { label: "العصر", val: activePrayerTimes.Asr, icon: <CloudSun className="w-4 h-4" /> },
                  { label: "المغرب", val: activePrayerTimes.Maghrib, icon: <Sunset className="w-4 h-4" /> },
                  { label: "العشاء", val: activePrayerTimes.Isha, icon: <Moon className="w-4 h-4" /> },
                ].map((item, id) => {
                  const isNext = item.label === nextPrayerName;
                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 border relative ${
                        isNext
                          ? "bg-emerald-500/10 text-white font-bold border-emerald-500/35"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-white/90"
                      }`}
                    >
                      {/* Right Part: Icon + Label */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isNext ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/50"
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`text-sm ${isNext ? "text-emerald-400 font-black" : "text-white/80 font-medium"}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Left Part: Time */}
                      <div className="flex items-center">
                        <span className={`text-sm font-bold font-mono tracking-wide ${
                          isNext ? "text-emerald-300" : "text-white/70"
                        }`}>
                          {convertTo12Hour(item.val)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Egyptian Mosques & Historical Landmarks Info Card */}
              <div className="p-3.5 bg-[#0F1E36]/30 border border-white/5 rounded-xl">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">نفحات إسلامية مصرية</span>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  مصر بلد الألف مئذنة، من الأزهر الشريف وجامع عمرو بن العاص إلى مسجد الفتاح العليم، تمسك بقرآنك وتلاوتك واجعل السكينة تعمر ثنايا قلبك الليلة.
                </p>
              </div>

              {/* Designer & Developer Credit */}
              <div className="text-center mt-2.5 mb-0 select-none">
                <span className="text-[11px] text-white/25 font-medium block">
                  تم تصميم وتطوير التطبيق بواسطة المهندس أدهم
                </span>
              </div>

            </div>
          )}

          {/* ================= TAB: QURAN ================= */}
          {activeTab === "quran" && (
            <div className="flex-1 flex flex-col h-full text-right animate-in fade-in duration-200">
              
              {/* IF showSurahDrawer is TRUE: SHOW THE FULL INDEX PAGE */}
              {showSurahDrawer ? (
                <div className="flex-1 flex flex-col gap-4">
                  {/* Index Header & Search Bar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Menu className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-sm text-emerald-400">الفهرس العام للسور الكريمة</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowSurahDrawer(false);
                          triggerSound("chime");
                        }}
                        className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold flex items-center gap-1"
                      >
                        <span>إغلاق ✕</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-emerald-400 absolute top-3 right-3" />
                      <input
                        type="text"
                        value={quranSearch}
                        onChange={(e) => setQuranSearch(e.target.value)}
                        placeholder="ابحث عن السورة (الفاتحة، الملك، الكهف)..."
                        className="w-full bg-black/45 text-xs text-white font-bold border border-white/10 rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-white/30 text-right"
                      />
                    </div>
                  </div>

                  {/* Vertical Surah Index List - Stacked under each other */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1 max-h-[500px]">
                    {filteredSurahs.map((surah) => {
                      const isCur = selectedSurah.number === surah.number;
                      return (
                        <button
                          key={surah.number}
                          onClick={() => {
                            setSelectedSurah(surah);
                            setActiveTafsirVerse(null);
                            setVerseTafsirContent("");
                            setShowSurahDrawer(false);
                            triggerSound("chime");
                          }}
                          className={`w-full text-right px-4 py-3 rounded-xl text-xs font-bold border transition-all flex justify-between items-center ${
                            isCur
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-black/35 text-white/80 border-white/5 hover:border-emerald-500/20 hover:bg-black/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[11px] text-emerald-400 font-mono font-bold border border-emerald-500/20">
                              {surah.number}
                            </span>
                            <span className="text-sm font-bold">{surah.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <span>{surah.revelationType === "Meccan" || surah.revelationType === "مكية" ? "مكية" : "مدنية"}</span>
                            <span>•</span>
                            <span>{surah.numberOfAyahs} آية</span>
                          </div>
                        </button>
                      );
                    })}
                    {filteredSurahs.length === 0 && (
                      <div className="text-center py-12 text-white/40 text-xs">لا توجد سورة تطابق البحث.</div>
                    )}
                  </div>
                </div>
              ) : (
                /* IF showSurahDrawer is FALSE: SHOW THE BEAUTIFUL FULL-PAGE READING VIEW */
                <div className="flex-1 flex flex-col gap-3">
                  
                  {/* Top Compact Navigation & Settings Bar */}
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                    
                    {/* Index Drawer Button */}
                    <button
                      onClick={() => {
                        setShowSurahDrawer(true);
                        triggerSound("chime");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 rounded-lg text-xs font-bold transition-all"
                    >
                      <Menu className="w-4 h-4" />
                      <span>فهرس السور</span>
                    </button>

                    {/* Compact Font Size Adjuster */}
                    <div className="flex items-center gap-2.5 text-xs text-white/60">
                      <span>حجم الخط:</span>
                      <div className="flex items-center gap-1 bg-black/30 rounded-lg p-0.5 border border-white/5">
                        <button 
                          onClick={() => { setQuranFontSize(Math.max(quranFontSize - 2, 16)); triggerSound("bead"); }} 
                          className="w-6 h-6 flex items-center justify-center rounded text-white/80 font-bold hover:bg-white/5"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-emerald-400 px-1.5 text-[11px]">{quranFontSize}px</span>
                        <button 
                          onClick={() => { setQuranFontSize(Math.min(quranFontSize + 2, 36)); triggerSound("bead"); }} 
                          className="w-6 h-6 flex items-center justify-center rounded text-white/80 font-bold hover:bg-white/5"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complete Mushaf Page View */}
                  <div className="flex-1 flex flex-col">
                    {isSurahLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-white">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
                        <p className="font-sans text-xs text-white/70 font-bold">جاري تحميل آيات {selectedSurah.name} الكريمة...</p>
                        <span className="text-[10px] text-white/40 mt-1">نسعى لتوفير المصحف كاملاً بجودة عالية</span>
                      </div>
                    ) : (selectedSurah.verses && selectedSurah.verses.length > 0) ? (
                      <div className="flex-1 flex flex-col gap-3 h-full">
                        
                        {/* Authentic Elegant Mushaf Page */}
                        <div 
                          className="flex-1 bg-[#FAF6EC] text-[#1C120C] border-2 border-amber-900/15 rounded-2xl p-1.5 md:p-2.5 shadow-2xl relative min-h-[460px] max-h-[500px] flex flex-col" 
                          dir="rtl"
                        >
                          {/* Zoom Button: Square inside a Circle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerSound("bead");
                              setIsMushafFullScreen(true);
                              setIsFullScreenBtnVisible(true);
                            }}
                            className="absolute top-4 right-4 z-[110] w-9 h-9 rounded-full flex items-center justify-center border border-amber-900/10 bg-amber-900/5 text-amber-900/40 hover:bg-amber-900/15 hover:text-amber-900/80 shadow-sm transition-all duration-200 cursor-pointer"
                            title="ملء الشاشة"
                          >
                            <div className="w-3.5 h-3.5 border-2 rounded-[3px] border-current" />
                          </button>

                          {/* Inner Decorative Islamic Border Frame */}
                          <div className="flex-1 border-2 border-amber-900/10 rounded-xl p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start relative">
                            
                            {/* Traditional Surah Header Frame Box */}
                            <div className="border border-amber-950/20 rounded-lg py-2 px-4 mb-5 bg-amber-950/[0.03] text-center select-none max-w-xs mx-auto w-full relative">
                              {/* Decorative corner accents */}
                              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-950/30"></div>
                              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-950/30"></div>
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-950/30"></div>
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-950/30"></div>
                              
                              <span className="text-[9px] text-amber-900/60 font-bold block leading-none mb-1">
                                سورة {selectedSurah.revelationType === "Meccan" || selectedSurah.revelationType === "مكية" ? "مكية" : "مدنية"} • {selectedSurah.numberOfAyahs} آية
                              </span>
                              <h3 className="font-amiri text-xl font-extrabold text-amber-950 tracking-wide leading-none">
                                {selectedSurah.name}
                              </h3>
                            </div>

                            {/* Basmalah */}
                            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                              <div className="text-center mb-5 font-bold text-amber-950 font-amiri text-lg select-none tracking-normal">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                              </div>
                            )}

                            {/* Quran text flowing naturally */}
                            <div 
                              className="leading-[2.6] text-center font-amiri tracking-normal" 
                              style={{ fontSize: `${quranFontSize}px` }}
                            >
                              {selectedSurah.verses.map((verse) => {
                                const isSelected = selectedVerseNum === verse.number;
                                return (
                                  <span
                                    key={verse.number}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVerseNum(verse.number === selectedVerseNum ? null : verse.number);
                                      triggerSound("bead");
                                    }}
                                    className={`inline transition-all duration-150 cursor-pointer rounded px-1.5 py-1 ${
                                      isSelected
                                        ? "bg-emerald-500/10 text-emerald-950 font-extrabold ring-1 ring-emerald-500/25"
                                        : "hover:bg-amber-950/[0.04] hover:text-amber-950 text-[#1C120C]"
                                    }`}
                                  >
                                    {cleanQuranText(verse.text)}
                                    
                                    {/* Elegant circular Verse Number frame */}
                                    <span className={`inline-flex items-center justify-center mx-1.5 w-6 h-6 rounded-full border text-[11px] font-sans font-black leading-none select-none ${
                                      isSelected
                                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                                        : "bg-amber-900/10 border-amber-900/20 text-amber-900/60"
                                    }`}>
                                      {verse.number}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>

                          </div>
                        </div>

                        {/* Interactive Verse Translation & Actions overlay */}
                        {selectedVerseNum && (
                          <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2 text-xs animate-in slide-in-from-bottom-2 duration-200">
                            <div className="text-right w-full sm:w-auto">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px]">الآية {selectedVerseNum}</span>
                                <span className="text-white/40 text-[9px]">انقر مجدداً لإلغاء التحديد</span>
                              </div>
                              {selectedSurah.verses && selectedSurah.verses[selectedVerseNum - 1] && (
                                <div className="mt-2 flex flex-col gap-1.5 text-right">
                                  {/* Arabic Verse Text */}
                                  <p className="text-white font-amiri text-[15px] font-bold leading-relaxed" dir="rtl">
                                    {selectedSurah.verses[selectedVerseNum - 1].text}
                                  </p>
                                  {/* English Translation */}
                                  {selectedSurah.verses[selectedVerseNum - 1].translation && (
                                    <p className="text-white/60 text-[11px] leading-normal border-t border-white/5 pt-1.5" dir="ltr">
                                      {selectedSurah.verses[selectedVerseNum - 1].translation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
                              <button
                                onClick={() => {
                                  const currentVerseText = selectedSurah.verses ? selectedSurah.verses[selectedVerseNum - 1]?.text : "";
                                  copyStaticText(`﴿${cleanQuranText(currentVerseText)}﴾ [${selectedSurah.name} - آية ${selectedVerseNum}]`);
                                }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/35 hover:bg-emerald-500/20 transition-all"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ الآية</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="text-center py-16 text-white/40 text-xs">
                        لا توجد آيات متوفرة لهذه السورة الكريمة حالياً.
                      </div>
                    )}
                  </div>

                </div>
              )}

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
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSel
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-[#0F1E36]/50 text-white/70 border-white/5 hover:border-emerald-500/40"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-xs text-white/40 font-semibold">تكرار الأذكار بالضغط على البطاقة:</span>
                <button
                  onClick={() => resetCategoryCounter(selectedAthkarCat)}
                  className="px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/30 rounded-lg flex items-center gap-1 transition-all"
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
                          ? "bg-emerald-950/30 border-emerald-500/50"
                          : "bg-[#0F1C2E] border-white/10 hover:border-emerald-500/50"
                      }`}
                    >
                      {/* Counter Badge */}
                      <div className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-bold ${
                        isDone ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/70"
                      }`}>
                        {isDone ? (
                          <span className="font-bold flex items-center gap-0.5">✓ تم الورد</span>
                        ) : (
                          <span>كرر: {item.currentCount} / {item.count}</span>
                        )}
                      </div>

                      <p className="font-amiri text-base text-white tracking-wide leading-relaxed pl-20 my-1 font-bold">
                        {item.text}
                      </p>

                      {item.description && (
                        <p className="text-[10px] text-white/50 mt-2 font-medium bg-white/[0.02] p-2 rounded border border-white/5">
                          {item.description}
                        </p>
                      )}

                      {item.reference && (
                        <span className="text-[9px] text-white/30 float-left mt-2 block font-normal">{item.reference}</span>
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
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">المسبحة الإلكترونية المصرية</span>
                <p className="text-white/40 text-[10px] mt-1.5">انقر على المستطيل الدائري الكبير لزيادة حبات تسبيحك</p>
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
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        isCur ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" : "bg-[#0F1E36]/50 text-white/70 border-white/5 hover:border-emerald-500/40"
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
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-4 py-1 rounded-full border border-emerald-500/20">
                  مجموع الأوراد بالجلسة الحالية: <span className="font-mono text-xs">{sessionTotalTasbih}</span>
                </div>

                {/* Simulated bead clicker */}
                <button
                  onClick={handleSebhaClick}
                  className="w-44 h-44 rounded-full bg-gradient-to-br from-[#0F1E36] to-[#0A121E] border-4 border-emerald-500 flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all text-white relative focus:outline-none"
                >
                  <span className="text-[10px] text-emerald-400 opacity-80">انقر هنا للتسبيح</span>
                  <span className="text-4xl font-mono font-black my-1 text-white">{tasbihCount}</span>
                  <span className="text-[10px] text-emerald-400 font-bold truncate max-w-[130px]">{tasbihPhrase}</span>
                  
                  {/* Goal label indicator inside circle */}
                  <span className="absolute bottom-2.5 text-[9px] text-white/40 font-semibold">المستهدف: {tasbihGoal}</span>
                </button>

                {/* Adjust Goal & Reset */}
                <div className="flex items-center gap-3.5 mt-2">
                  <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg text-xs border border-white/5">
                    <span className="text-white/40 font-bold px-1">الإنهاء عند:</span>
                    {[33, 99, 100].map(goalVal => {
                      const isG = tasbihGoal === goalVal;
                      return (
                        <button
                          key={goalVal}
                          onClick={() => { setTasbihGoal(goalVal); setTasbihCount(0); triggerSound("chime"); }}
                          className={`px-2 py-0.5 rounded font-black transition-all ${isG ? "bg-emerald-500/15 text-emerald-400" : "bg-transparent text-white/60 hover:text-white"}`}
                        >
                          {goalVal}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { setTasbihCount(0); triggerSound("chime"); }}
                    className="p-1 px-3.5 text-[10px] bg-red-950/40 text-red-400 hover:bg-red-900/50 font-bold rounded-lg border border-red-900/30 transition-all"
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
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">تحديد اتجاه القبلة</span>
                <p className="text-white/40 text-[10px] mt-1.5">متركزة لمحافظة {selectedCity.nameAr}</p>
              </div>

              {/* Compass simulator container */}
              <div className="relative w-48 h-48 rounded-full border-4 border-emerald-500 bg-[#0F1C2E] flex items-center justify-center p-2 shadow-inner">
                
                {/* Compass Dial aligned to relative angle */}
                <div
                  className="w-full h-full rounded-full relative transition-transform duration-300"
                  style={{ transform: `rotate(${-userCompassHeading}deg)` }}
                >
                  {/* North marker */}
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-rose-500 font-black text-xs font-mono">N</span>
                  {/* East marker */}
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 font-black text-[9px] font-mono">E</span>
                  {/* South marker */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/40 font-black text-[9px] font-mono">S</span>
                  {/* West marker */}
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-white/40 font-black text-[9px] font-mono">W</span>

                  {/* Qibla Angle Needle Pointer (Targeting Mecca around 135°-138° in Egypt) */}
                  <div
                    className="absolute w-1.5 h-1/2 bg-emerald-500 origin-bottom bottom-1/2 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${targetQiblaAngle}deg)` }}
                  >
                    {/* Tiny Kaaba Dome Representation top */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-base">🕋</div>
                  </div>
                </div>

                {/* Inner alignment confirmator bulb */}
                <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs shadow transition-all ${isAligned ? "bg-emerald-500 text-white" : "bg-white/5 text-white/40"}`}>
                  {isAligned ? "✓" : "⚙"}
                </div>

              </div>

              {/* Slider simulation for user to manually adjust the heading on screen (مريح للعين وتفاعلي كأنك تلف الهاتف) */}
              <div className="w-full max-w-xs bg-[#0F1C2E] border border-white/5 p-4 rounded-xl text-xs shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white/80 block">موازنة الاتجاه الجغرافي:</span>
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
                  className="w-full mt-2 cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between items-center text-[10px] text-white/40 mt-2 font-mono">
                  <span>زاوية الهاتف الحالية: {userCompassHeading}°</span>
                  <span className="text-emerald-400 font-bold">زاوية القبلة لمحافظتك: {targetQiblaAngle}°</span>
                </div>

                {isAligned ? (
                  <p className="text-[11px] text-emerald-400 font-bold leading-normal mt-2.5 text-center">
                    ✓ الهاتف موجه بدقة فائقة نحو مكة المكرمة والكعبة الشريفة الآن.
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-500/80 font-medium leading-normal mt-2.5 text-center">
                    حرك شريط الموازنة بالأعلى لمحاكاة محاذاة البوصلة للحصول على التوجيه السليم.
                  </p>
                )}
              </div>

            </div>
          )}



        </div>

        {/* Stable and Comfortable Bottom App Navigation Bar */}
        <footer className="transition-all duration-300 px-2 py-3 flex justify-around items-center select-none bg-black/70 border-t border-white/10 shadow-2xl z-20 pb-5">
          
          <button
            onClick={() => { setActiveTab("home"); triggerSound("chime"); }}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === "home"
                ? "text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl font-bold scale-105"
                : "text-white/50 hover:text-white/80 px-3 py-1.5"
            }`}
          >
            <Home className="w-[22px] h-[22px]" strokeWidth={2.2} />
            <span className="text-[9px] mt-1 font-bold">الرئيسية</span>
          </button>

          <button
            onClick={() => { setActiveTab("quran"); triggerSound("chime"); }}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === "quran"
                ? "text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl font-bold scale-105"
                : "text-white/50 hover:text-white/80 px-3 py-1.5"
            }`}
          >
            <BookOpen className="w-[22px] h-[22px]" strokeWidth={2.2} />
            <span className="text-[9px] mt-1 font-bold">المصحف</span>
          </button>

          <button
            onClick={() => { setActiveTab("athkar"); triggerSound("chime"); }}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === "athkar"
                ? "text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl font-bold scale-105"
                : "text-white/50 hover:text-white/80 px-3 py-1.5"
            }`}
          >
            <Layers className="w-[22px] h-[22px]" strokeWidth={2.2} />
            <span className="text-[9px] mt-1 font-bold">الأذكار</span>
          </button>

          <button
            onClick={() => { setActiveTab("sebha"); triggerSound("chime"); }}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === "sebha"
                ? "text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl font-bold scale-105"
                : "text-white/50 hover:text-white/80 px-3 py-1.5"
            }`}
          >
            <Award className="w-[22px] h-[22px]" strokeWidth={2.2} />
            <span className="text-[9px] mt-1 font-bold">المسبحة</span>
          </button>

          <button
            onClick={() => { setActiveTab("qibla"); triggerSound("chime"); }}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeTab === "qibla"
                ? "text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-2xl font-bold scale-105"
                : "text-white/50 hover:text-white/80 px-3 py-1.5"
            }`}
          >
            <Compass className="w-[22px] h-[22px]" strokeWidth={2.2} />
            <span className="text-[9px] mt-1 font-bold">القبلة</span>
          </button>

        </footer>

        {/* Fullscreen Mushaf Page */}
        {isMushafFullScreen && (
          <div 
            className="absolute inset-0 z-[100] bg-[#FAF6EC] text-[#1C120C] p-3 md:p-5 flex flex-col w-full h-full select-none overflow-hidden animate-in fade-in duration-300"
            dir="rtl"
            onClick={() => {
              setIsFullScreenBtnVisible(prev => !prev);
            }}
          >
            {/* Zoom Button: Square inside a Circle */}
            {isFullScreenBtnVisible && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSound("bead");
                  setIsMushafFullScreen(false);
                }}
                className="absolute top-4 right-4 z-[110] w-9 h-9 rounded-full flex items-center justify-center border border-amber-900/10 bg-amber-900/5 text-amber-900/40 hover:bg-amber-900/15 hover:text-amber-900/80 shadow-md transition-all duration-200 cursor-pointer"
                title="تصغير الشاشة"
              >
                <div className="w-3.5 h-3.5 border-2 rounded-[3px] border-current scale-90" />
              </button>
            )}

            {/* Inner Decorative Islamic Border Frame */}
            <div className="flex-1 border-2 border-amber-900/10 rounded-xl p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start relative">
              
              {/* Traditional Surah Header Frame Box */}
              <div className="border border-amber-950/20 rounded-lg py-2 px-4 mb-5 bg-amber-950/[0.03] text-center select-none max-w-xs mx-auto w-full relative">
                {/* Decorative corner accents */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-950/30"></div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-950/30"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-950/30"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-950/30"></div>
                
                <span className="text-[9px] text-amber-900/60 font-bold block leading-none mb-1">
                  سورة {selectedSurah.revelationType === "Meccan" || selectedSurah.revelationType === "مكية" ? "مكية" : "مدنية"} • {selectedSurah.numberOfAyahs} آية
                </span>
                <h3 className="font-amiri text-xl font-extrabold text-amber-950 tracking-wide leading-none">
                  {selectedSurah.name}
                </h3>
              </div>

              {/* Basmalah */}
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <div className="text-center mb-5 font-bold text-amber-950 font-amiri text-lg select-none tracking-normal">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}

              {/* Quran text flowing naturally */}
              <div 
                className="leading-[2.6] text-center font-amiri tracking-normal animate-in fade-in duration-300" 
                style={{ fontSize: `${quranFontSize}px` }}
              >
                {selectedSurah.verses && selectedSurah.verses.map((verse) => {
                  const isSelected = selectedVerseNum === verse.number;
                  return (
                    <span
                      key={verse.number}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVerseNum(verse.number === selectedVerseNum ? null : verse.number);
                        triggerSound("bead");
                      }}
                      className={`inline transition-all duration-150 cursor-pointer rounded px-1.5 py-1 ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-950 font-extrabold ring-1 ring-emerald-500/25"
                          : "hover:bg-amber-950/[0.04] hover:text-amber-950 text-[#1C120C]"
                      }`}
                    >
                      {cleanQuranText(verse.text)}
                      
                      {/* Elegant circular Verse Number frame */}
                      <span className={`inline-flex items-center justify-center mx-1.5 w-6 h-6 rounded-full border text-[11px] font-sans font-black leading-none select-none ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-800"
                          : "bg-amber-900/10 border-amber-900/20 text-amber-900/60"
                      }`}>
                        {verse.number}
                      </span>
                    </span>
                  );
                })}
              </div>

            </div>

            {/* Elegant compact translation overlay inside fullscreen if a verse is selected and the UI is visible */}
            {selectedVerseNum && isFullScreenBtnVisible && selectedSurah.verses && selectedSurah.verses[selectedVerseNum - 1] && (
              <div className="absolute bottom-6 left-6 right-6 z-[110] bg-amber-950/95 text-[#FAF6EC] border border-amber-900/30 p-3 rounded-xl flex flex-col gap-1.5 shadow-xl animate-in slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-amber-900/20 pb-1.5">
                  <span className="bg-[#FAF6EC]/10 text-amber-200 px-2 py-0.5 rounded-full font-bold text-[9px]">الآية {selectedVerseNum}</span>
                  <button 
                    onClick={() => { setSelectedVerseNum(null); triggerSound("bead"); }}
                    className="text-[#FAF6EC]/60 hover:text-white text-[10px]"
                  >
                    إغلاق التحديد
                  </button>
                </div>
                {/* Arabic Text */}
                <p className="font-amiri text-[13px] font-bold leading-relaxed text-right" dir="rtl">
                  {selectedSurah.verses[selectedVerseNum - 1].text}
                </p>
                {/* English Text */}
                {selectedSurah.verses[selectedVerseNum - 1].translation && (
                  <p className="text-[#FAF6EC]/70 text-[10px] leading-normal border-t border-amber-900/20 pt-1 text-left" dir="ltr">
                    {selectedSurah.verses[selectedVerseNum - 1].translation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
