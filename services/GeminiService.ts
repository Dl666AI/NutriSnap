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
  try {
    const response = await fetch('/api/analyze/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as FoodAnalysisResult;
  } catch (error) {
    console.error("Analysis Failed:", error);
    throw error;
  }
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  try {
    const response = await fetch('/api/analyze/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as FoodAnalysisResult;
  } catch (error) {
    console.error("Text Analysis Failed:", error);
    throw error;
  }
}