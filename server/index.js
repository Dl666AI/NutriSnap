import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (ensure process.env.API_KEY is available)
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Increase limit for base64 image uploads
app.use(bodyParser.json({ limit: '50mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            text: `Analyze this image. Identify the food item and estimate its nutritional content for a standard serving size. 
                   Be realistic with calorie estimates. If it is not food, return a low confidence score.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      res.json(data);
    } else {
      res.status(500).json({ error: "No data returned from AI" });
    }
  } catch (error) {
    console.error("AI Error:", error);
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
                   Identify the most likely food item(s) and estimate nutritional content.
                   Return specific numbers for calories, protein, carbs, fat, and sugar based on standard serving sizes.
                   Be realistic. If the text is gibberish or not food, return low confidence.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      res.json(data);
    } else {
      res.status(500).json({ error: "No data returned from AI" });
    }
  } catch (error) {
    console.error("AI Text Error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// --- Serve Frontend (Static Files) ---
// This allows the Node server to serve the React app in production
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));

// Handle SPA routing: return index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});