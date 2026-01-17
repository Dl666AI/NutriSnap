import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client. 
// NOTE: Ensure process.env.API_KEY is set in your environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  confidence: number;
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  // 1. Clean the base64 string (remove the data URL header if present)
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    // 2. Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG from camera/canvas
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
            name: { 
              type: Type.STRING,
              description: "The name of the food item identified."
            },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER, description: "Protein in grams" },
            carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            fat: { type: Type.NUMBER, description: "Fat in grams" },
            sugar: { type: Type.NUMBER, description: "Sugar in grams" },
            confidence: { 
              type: Type.NUMBER, 
              description: "A score from 0 to 100 indicating how confident you are that this is food and the data is accurate." 
            }
          },
          required: ["name", "calories", "protein", "carbs", "fat", "sugar", "confidence"]
        }
      }
    });

    // 3. Parse and return result
    if (response.text) {
      const data = JSON.parse(response.text) as FoodAnalysisResult;
      return data;
    } else {
      throw new Error("No data returned from AI model");
    }

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Latest, fast model suitable for text analysis
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
            name: { 
              type: Type.STRING,
              description: "A short, concise name for the meal described."
            },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER, description: "Protein in grams" },
            carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            fat: { type: Type.NUMBER, description: "Fat in grams" },
            sugar: { type: Type.NUMBER, description: "Sugar in grams" },
            confidence: { 
              type: Type.NUMBER, 
              description: "A score from 0 to 100." 
            }
          },
          required: ["name", "calories", "protein", "carbs", "fat", "sugar", "confidence"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysisResult;
    } else {
      throw new Error("No data returned from AI model");
    }
  } catch (error) {
    console.error("Gemini Text Analysis Failed:", error);
    throw error;
  }
}
