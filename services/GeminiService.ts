import { GoogleGenAI, Type } from "@google/genai";

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  confidence: number;
}

// Initialize client-side fallback
// We use optional chaining or default to empty string to prevent crash if env is missing
const apiKey = process.env.API_KEY || '';
const clientAI = new GoogleGenAI({ apiKey });

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

/**
 * Helper to perform client-side analysis using Gemini SDK directly in browser.
 */
async function performClientSideAnalysis(
  input: { type: 'image', data: string } | { type: 'text', data: string }
): Promise<FoodAnalysisResult> {
  if (!apiKey) {
    throw new Error("Missing API Key for client-side fallback. Please check your .env configuration.");
  }

  try {
    let promptParts: any[] = [];
    
    if (input.type === 'image') {
      const cleanBase64 = input.data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      promptParts = [
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
      ];
    } else {
      promptParts = [
        {
          text: `Analyze this food description: "${input.data}". 
                 Identify the most likely food item(s) and estimate nutritional content.
                 Return specific numbers for calories, protein, carbs, fat, and sugar based on standard serving sizes.
                 Be realistic. If the text is gibberish or not food, return low confidence.`
        }
      ];
    }

    const response = await clientAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysisResult;
    }
    throw new Error("AI returned empty response");
  } catch (error) {
    console.error("Client-side Analysis Error:", error);
    throw error;
  }
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  // 1. Try Server API
  try {
    const response = await fetch('/api/analyze/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (response.ok) {
      return await response.json();
    }
    // If we get here, server exists but failed (e.g. 500) OR route missing (404)
    console.warn(`Backend API returned ${response.status}, switching to Client SDK.`);
  } catch (error) {
    // If we get here, network failed (e.g. server offline, CORS)
    console.warn("Backend API unreachable, switching to Client SDK.", error);
  }

  // 2. Client-Side Fallback (Executed if server block failed/skipped)
  return performClientSideAnalysis({ type: 'image', data: base64Image });
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  // 1. Try Server API
  try {
    const response = await fetch('/api/analyze/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    if (response.ok) {
      return await response.json();
    }
    console.warn(`Backend API returned ${response.status}, switching to Client SDK.`);
  } catch (error) {
    console.warn("Backend API unreachable, switching to Client SDK.", error);
  }

  // 2. Client-Side Fallback
  return performClientSideAnalysis({ type: 'text', data: description });
}