export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  confidence: number;
}

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

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  // All AI analysis MUST be done server-side to protect the API key.
  try {
    const serverPromise = fetch('/api/analyze/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status: ${res.status}`);
      }
      return await res.json();
    });

    return await withTimeout(serverPromise, 30000, "AI analysis request timed out");
  } catch (error: any) {
    console.error("AI Analysis failed:", error.message);
    throw error;
  }
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysisResult> {
  try {
    const serverPromise = fetch('/api/analyze/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status: ${res.status}`);
      }
      return await res.json();
    });

    return await withTimeout(serverPromise, 30000, "AI analysis request timed out");
  } catch (error: any) {
    console.error("AI Analysis failed:", error.message);
    throw error;
  }
}
