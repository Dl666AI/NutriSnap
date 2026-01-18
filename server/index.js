import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Log API Key status on startup (masked)
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("CRITICAL: process.env.API_KEY is missing on server!");
} else {
  console.log(`Server initialized with API Key: ${apiKey.substring(0, 4)}...`);
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: apiKey });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    sugar: { type: Type.NUMBER },
    confidence: { type: Type.NUMBER }
  },
  required: ["name", "calories", "protein", "carbs", "fat", "sugar", "confidence"]
};

// --- AI Routes ---

app.post('/api/analyze/image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data required' });
  }

  // Clean base64
  const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Identify this food. Estimate calories/macros for a standard serving. 
                   - Make a best-effort guess for any edible item or food packaging.
                   - Set confidence to 100 if it is likely food.
                   - Only set confidence to 0 if it is clearly non-food (like a person or shoe).
                   Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      console.log("AI Response received (Image)");
      const data = JSON.parse(response.text);
      res.json(data);
    } else {
      console.error("Server AI returned no text. Candidates:", JSON.stringify(response.candidates));
      res.status(500).json({ error: "No data returned from AI" });
    }
  } catch (error) {
    console.error("Server AI Image Analysis Error:", error);
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
});

app.post('/api/analyze/text', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `Analyze this food description: "${description}". 
                   Estimate calories and macros.
                   - Always provide a result if text describes food.
                   - Set confidence to 100 for valid descriptions.
                   - Set confidence to 0 only for gibberish.
                   Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      console.log("AI Response received (Text)");
      const data = JSON.parse(response.text);
      res.json(data);
    } else {
      console.error("Server AI returned no text. Candidates:", JSON.stringify(response.candidates));
      res.status(500).json({ error: "No data returned from AI" });
    }
  } catch (error) {
    console.error("Server AI Text Analysis Error:", error);
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
});

// --- Serve Frontend (Static Files) ---
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});