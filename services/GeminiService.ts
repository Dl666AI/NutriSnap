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

// Helper: strictly enforce timeout on any promise
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Client-side analysis using Gemini SDK directly in browser.
 */
async function performClientSideAnalysis(
  input: { type: 'image', data: string } | { type: 'text', data: string }
): Promise<FoodAnalysisResult> {
  if (!apiKey) {
    throw new Error("Client-side fallback unavailable: Missing API Key.");
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
          text: `Identify this food. Estimate calories/macros for a standard serving. 
                 If it is food, set confidence to 90.
                 If it is NOT food, set confidence to 0.
                 Return JSON.`
        }
      ];
    } else {
      promptParts = [
        {
          text: `Analyze this food description: "${input.data}". 
                 Estimate calories and macros.
                 If valid food, set confidence to 90.
                 If gibberish, set confidence 0.
                 Return JSON.`
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
  // We wrap the entire process (Server Attempt + Potential Client Fallback) in one flow
  // but we time-box each step.

  let serverError: Error | null = null;

  // 1. Try Server API (Timeout: 20s)
  try {
    const serverPromise = fetch('/api/analyze/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      return await res.json();
    });

    return await withTimeout(serverPromise, 20000, "Server request timed out");
  } catch (error: any) {
    console.warn("Server API failed:", error);
    serverError = error;
  }

  // 2. Client-Side Fallback (Timeout: 15s)
  // Only attempt if we have a key. If not, throw the Server Error to be helpful.
  if (!apiKey) {
    console.error("No client API key found. Cannot fallback.");
    throw serverError || new Error("Server failed and no client key available.");
  }

  try {
    const clientPromise = performClientSideAnalysis({ type: 'image', data: base64Image });
    return await withTimeout(clientPromise, 15000, "Client fallback timed out");
  } catch (clientError) {
    console.error("Client fallback failed:", clientError);
    // Throw the initial server error if it exists, as it's usually the root cause in prod
    throw serverError || clientError;
  }
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  let serverError: Error | null = null;

  // 1. Try Server API (Timeout: 10s)
  try {
    const serverPromise = fetch('/api/analyze/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      return await res.json();
    });

    return await withTimeout(serverPromise, 10000, "Server request timed out");
  } catch (error: any) {
    console.warn("Server API failed:", error);
    serverError = error;
  }

  // 2. Client-Side Fallback (Timeout: 10s)
  if (!apiKey) {
    throw serverError || new Error("Server failed and no client key available.");
  }

  try {
    const clientPromise = performClientSideAnalysis({ type: 'text', data: description });
    return await withTimeout(clientPromise, 10000, "Client fallback timed out");
  } catch (clientError) {
    console.error("Client fallback failed:", clientError);
    throw serverError || clientError;
  }
}
