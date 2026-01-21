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

// Helper: robust data URL parsing
function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], data: matches[2] };
  }
  // Fallback for raw base64 strings
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// Helper: Clean JSON string from potential markdown
function parseJsonSafe(text: string): any {
  try {
    const cleanText = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("Failed to parse AI response");
  }
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

  // Create instance here to ensure we use current key
  const clientAI = new GoogleGenAI({ apiKey });

  try {
    let promptParts: any[] = [];

    if (input.type === 'image') {
      const { mimeType, data } = parseDataUrl(input.data);

      promptParts = [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        {
          text: `Identify this food item. Estimate calories and macros for a standard serving.
                 - Always make a best-effort guess, even for packaged goods or unclear images.
                 - Set confidence to 100 if you can identify ANY food, drink, or food packaging.
                 - Only set confidence to 0 if the image is clearly a non-food object (like a shoe) or pitch black.
                 Return strictly JSON.`
        }
      ];
    } else {
      promptParts = [
        {
          text: `Analyze this food description: "${input.data}". 
                 Estimate calories and macros.
                 - Always provide a result if the text describes something edible.
                 - Set confidence to 100 for any valid food description.
                 - Only set confidence to 0 for complete gibberish.
                 Return strictly JSON.`
        }
      ];
    }

    const response = await clientAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      return parseJsonSafe(response.text) as FoodAnalysisResult;
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

  // 1. Try Server API (Timeout: 10s)
  // We keep this short because if dev server isn't running, we want to fail fast to client.
  try {
    const serverPromise = fetch('/api/analyze/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Server status: ${res.status}`);
      return await res.json();
    });

    return await withTimeout(serverPromise, 10000, "Server request timed out");
  } catch (error: any) {
    console.warn("Server API failed, attempting client fallback...", error.message);
    serverError = error;
  }

  // 2. Client-Side Fallback (Timeout: 30s)
  // Only attempt if we have a key. If not, throw the Server Error to be helpful.
  if (!apiKey) {
    console.error("No client API key found. Cannot fallback.");
    throw serverError || new Error("Server failed and no client API_KEY configured.");
  }

  try {
    const clientPromise = performClientSideAnalysis({ type: 'image', data: base64Image });
    return await withTimeout(clientPromise, 30000, "Client fallback timed out");
  } catch (clientError: any) {
    console.error("Client fallback failed:", clientError);
    // Prefer throwing the client error as it's the final attempt
    throw clientError;
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
    console.warn("Server API failed, attempting client fallback...", error.message);
    serverError = error;
  }

  // 2. Client-Side Fallback (Timeout: 20s)
  if (!apiKey) {
    throw serverError || new Error("Server failed and no client API_KEY configured.");
  }

  try {
    const clientPromise = performClientSideAnalysis({ type: 'text', data: description });
    return await withTimeout(clientPromise, 20000, "Client fallback timed out");
  } catch (clientError) {
    console.error("Client fallback failed:", clientError);
    throw clientError;
  }
}