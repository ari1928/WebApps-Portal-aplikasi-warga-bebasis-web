import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse json
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!apiKey });
});

app.post("/api/avatar/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!ai) {
      // Fallback SVG if API key is not configured yet
      console.warn("GEMINI_API_KEY is not defined. Returning a premium fallback SVG.");
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <clipPath id="circleClip">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
          </defs>
          <g clip-path="url(#circleClip)">
            <rect width="100" height="100" fill="url(#fallbackGrad)" />
            <!-- Cybernetic grid patterns -->
            <line x1="10" y1="0" x2="10" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="70" y1="0" x2="70" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="90" y1="0" x2="90" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
            
            <!-- Abstract futuristic face/helmet -->
            <circle cx="50" cy="45" r="22" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
            <path d="M38 45 Q50 35 62 45" fill="none" stroke="#38bdf8" stroke-width="1.5" />
            
            <!-- Glowing visor -->
            <rect x="36" y="42" width="28" height="6" rx="3" fill="#22c55e" filter="drop-shadow(0px 0px 4px #22c55e)" />
            <circle cx="44" cy="45" r="1.5" fill="#ffffff" />
            <circle cx="56" cy="45" r="1.5" fill="#ffffff" />
            
            <!-- Tech details -->
            <path d="M50 67 L50 85 M40 80 L60 80" stroke="#818cf8" stroke-width="2" stroke-linecap="round" />
            <circle cx="50" cy="5" r="2" fill="#38bdf8" />
            <circle cx="95" cy="50" r="1.5" fill="#a855f7" />
          </g>
          <circle cx="50" cy="50" r="48" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="3 3" />
        </svg>
      `;
      return res.json({ svg: fallbackSvg.trim(), warning: "No API key configured. Showing fallback avatar." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a beautiful circular vector SVG avatar based on the prompt: "${prompt}". It should be styled creatively and professionally.`,
      config: {
        systemInstruction: "You are an expert vector designer and digital artist. Your task is to generate a beautiful, modern, high-quality, circular vector SVG profile avatar inside a viewBox of '0 0 100 100'. Use rich gradients, smooth geometric shapes, clean paths, and futuristic/cybernetic/AI tech visual elements based on the prompt. The artwork must be fully self-contained inside a single SVG with all paths closed. Make sure the entire drawing is clipped or arranged so it is clean, centered, and perfectly circular. Avoid generic black-and-white icons; make them vibrant and aesthetically high-end.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            svg: {
              type: Type.STRING,
              description: "Complete raw SVG code of the circular avatar"
            }
          },
          required: ["svg"]
        }
      }
    });

    const jsonText = response.text?.trim() || "{}";
    const data = JSON.parse(jsonText);
    if (data.svg) {
      res.json({ svg: data.svg });
    } else {
      throw new Error("No SVG field returned from Gemini");
    }

  } catch (error: any) {
    console.error("Error generating SVG avatar:", error);
    res.status(500).json({ error: error.message || "Failed to generate SVG avatar" });
  }
});

// Vite middleware for development or serving build assets for production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
