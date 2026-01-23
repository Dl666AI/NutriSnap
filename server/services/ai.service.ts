import { GoogleGenAI, Type } from "@google/genai";

/**
 * SERVICE: AI Analysis using Google Gemini
 * Handles food image and text analysis
 */

export interface FoodAnalysisResult {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    confidence: number;
}

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

export class AIService {
    private ai: GoogleGenAI;

    constructor() {
        // Initialize Gemini with API key from environment
        const apiKey = process.env.API_KEY || 'placeholder_key';
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Analyze a food image using Gemini Vision
     * @param base64Image - Base64 encoded image data
     * @returns Food analysis result
     */
    async analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
        // Remove data URL prefix if present
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    {
                        text: `Identify this food item. Estimate calories and macros for a standard serving.
                       - Always make a best-effort guess, even for packaged goods or unclear images.
                       - Set confidence to 100 if you can identify ANY food, drink, or food packaging.
                       - Only set confidence to 0 if the image is clearly a non-food object (like a shoe) or pitch black.
                       Return strictly JSON.`
                    }
                ]
            },
            config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
        });

        if (!response.text) {
            throw new Error("Empty AI response");
        }

        return JSON.parse(response.text) as FoodAnalysisResult;
    }

    /**
     * Analyze a food description using Gemini
     * @param description - Text description of the food
     * @returns Food analysis result
     */
    async analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [{
                    text: `Analyze this food description: "${description}". 
                       Estimate calories and macros.
                       - Always provide a result if the text describes something edible.
                       - Set confidence to 100 for any valid food description.
                       - Only set confidence to 0 for complete gibberish.
                       Return strictly JSON.`
                }]
            },
            config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
        });

        if (!response.text) {
            throw new Error("Empty AI response");
        }

        return JSON.parse(response.text) as FoodAnalysisResult;
    }
}
