import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini client using the environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API route: AI Spiritual Guide and Tafsir
app.post("/api/ai-chat", async (req, res) => {
  const { message, history } = req.body;

  try {
    const formattedHistory = (history || []).map((chat: any) => ({
      role: chat.role === "user" ? "user" : "model",
      parts: [{ text: chat.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `أنت "مساعد الهدى الذكي"، عالم إسلامي ومستشار روحي لطيف وموثوق لتطبيق "طريق الهدى".
أجب على أسئلة المستخدمين الفقهية والعملية والتاريخية بأسلوب ميسر وصادق ومطمئن.
عند الإجابة، اعتمد بشكل مباشر على القرآن الكريم والسنة النبوية الشريفة متبوعاً بمصادرها.
شجع المستخدم بروحانية عالية وادعُ له بالخير الهداية والعافية.
يفضل كتابة الإجابات باللغة العربية الفصحى الأنيقة مع تشكيل الآيات القرآنية والأحاديث الشريفة والأدعية بدقة وعناية (مثل: ﴿الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ﴾).
اجعل الأسلوب مريحاً ومفعماً بالسكينة والأمل.`,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" });
  }
});

// API route: Quick Quranic Verse Tafsir
app.post("/api/tafsir", async (req, res) => {
  const { verseText, surahName, verseNumber } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `اشرح لي وتفسير هذه الآية الكريمة باختصار ووضوح:
الآية رقم ${verseNumber} من سورة ${surahName}: "${verseText}"
اجعل التفسير إيمانياً، تربوياً، وميسراً ومفهماً، يوضح سبب النزول إن وجد، والفوائد والدروس العملية المستفادة من الآية في حياتنا المعاصرة.`,
      config: {
        systemInstruction: "أنت مفسر قرآن قدير ومربي إسلامي حكيم تقدم تفسيراً ميسراً إيمانياً ينفع المسلم في حياته اليومية.",
        temperature: 0.5,
      }
    });

    res.json({ tafsir: response.text });
  } catch (error: any) {
    console.error("Tafsir Error:", error);
    res.status(500).json({ error: "تعذر الحصول على التفسير حالياً، يرجى المحاولة لاحقاً." });
  }
});

// Serve static assets or mount Vite Dev Server middleware
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode serving compiled SPA
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`طريق الهدى: Server loaded successfully on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
