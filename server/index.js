import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Robust Environment Loading ---
dotenv.config(); 
if (!process.env.DB_HOST) {
  console.log("DB_HOST not found in current dir, checking parent directory...");
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI, Type } from "@google/genai";
import pg from 'pg';

const { Pool } = pg;
export const app = express(); 
const PORT = process.env.PORT || 3000;

// Log Configuration Status
if (process.argv[1] === __filename) {
    console.log("--- Server Configuration ---");
    console.log(`Port: ${PORT}`);
    console.log(`DB Host: ${process.env.DB_HOST || 'MISSING'}`);
    console.log(`DB User: ${process.env.DB_USER || 'MISSING'}`);
    console.log("----------------------------");
}

// --- Database Connection ---
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' 
       ? { rejectUnauthorized: false } 
       : false, 
  connectionTimeoutMillis: 10000, 
};

export const pool = new Pool(dbConfig);

// --- DB Initialization Schema ---
const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    photo_url TEXT,
    height NUMERIC,
    weight NUMERIC,
    date_of_birth DATE,
    gender TEXT,
    goal TEXT,
    daily_calories INTEGER,
    daily_protein INTEGER,
    daily_carbs INTEGER,
    daily_sugar INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT,
    meal_time TEXT,
    meal_date DATE,
    type TEXT,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    sugar INTEGER,
    image_url TEXT
  );
`;

// Initialize DB
const initDb = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query(INIT_SQL);
      console.log("✅ Database tables initialized (users, meals)");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Failed to initialize database tables:", err.message);
  }
};

// Connect and Init
pool.connect((err, client, release) => {
  if (err) {
    if (process.argv[1] === __filename) {
        console.error('FATAL: Database Connection Failed!', err.message);
    }
  } else {
    if (process.argv[1] === __filename) {
        console.log('✅ Connected to PostgreSQL database successfully');
        initDb(); // Run migration
    }
    release();
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'placeholder_key' });

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

// --- SYSTEM ROUTES ---

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const timeResult = await pool.query('SELECT NOW() as time');
    const tablesResult = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      time: timeResult.rows[0].time,
      tables: tablesResult.rows.map(r => r.table_name),
      env: {
        api_key_set: !!process.env.API_KEY,
        db_host: process.env.DB_HOST
      }
    });
  } catch (err) {
    console.error("Health Check Failed:", err);
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: err.message 
    });
  }
});

// --- DATA ROUTES (PostgreSQL) ---

// Sync User (Upsert)
app.post('/api/users', async (req, res) => {
  const user = req.body;
  
  const query = `
    INSERT INTO users (id, name, email, photo_url, height, weight, date_of_birth, gender, goal, daily_calories, daily_protein, daily_carbs, daily_sugar)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      photo_url = EXCLUDED.photo_url,
      height = EXCLUDED.height,
      weight = EXCLUDED.weight,
      date_of_birth = EXCLUDED.date_of_birth,
      gender = EXCLUDED.gender,
      goal = EXCLUDED.goal,
      daily_calories = EXCLUDED.daily_calories,
      daily_protein = EXCLUDED.daily_protein,
      daily_carbs = EXCLUDED.daily_carbs,
      daily_sugar = EXCLUDED.daily_sugar,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    user.id, user.name, user.email, user.photoUrl,
    user.height, user.weight, user.dateOfBirth || null, user.gender,
    user.goal, user.dailyCalories, user.dailyProtein, user.dailyCarbs, user.dailySugar
  ];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (Sync User):", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get Meals
app.get('/api/meals', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Map database columns (snake_case) to frontend types (camelCase)
    const result = await pool.query(`
      SELECT id, name, meal_time as "time", meal_date::text as "date", 
             type, calories, protein, carbs, fat, sugar, image_url as "imageUrl"
      FROM meals 
      WHERE user_id = $1 
      ORDER BY meal_date DESC, meal_time DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error (Get Meals):", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add Meal
app.post('/api/meals', async (req, res) => {
  const { userId, meal } = req.body;
  if (!userId || !meal) return res.status(400).json({ error: 'Missing data' });

  // Note: We strip base64 image data here if it's not a URL, to prevent DB bloat.
  let imageUrl = meal.imageUrl;
  if (imageUrl && imageUrl.startsWith('data:')) {
      imageUrl = null; // Don't save base64 to SQL
  }

  // Ensure user exists first (FK check)
  try {
      const userCheck = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
      if (userCheck.rowCount === 0) {
          console.warn(`Meal added for unknown user ${userId}. Attempting lazy user creation...`);
          // Optional: Create a skeleton user so the meal can be saved
          await pool.query('INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, 'Unknown User']);
      }
  } catch (e) {
      console.error("Error checking user existence", e);
  }

  const query = `
    INSERT INTO meals (id, user_id, name, meal_time, meal_date, type, calories, protein, carbs, fat, sugar, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  
  const values = [
    meal.id, userId, meal.name, meal.time, meal.date, 
    meal.type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.sugar, imageUrl
  ];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error (Add Meal):", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update Meal
app.put('/api/meals/:id', async (req, res) => {
  const { id } = req.params;
  const { userId, meal } = req.body;

  const query = `
    UPDATE meals 
    SET name=$1, meal_time=$2, meal_date=$3, type=$4, calories=$5, 
        protein=$6, carbs=$7, fat=$8, sugar=$9
    WHERE id = $10 AND user_id = $11
    RETURNING *;
  `;
  
  const values = [
    meal.name, meal.time, meal.date, meal.type, meal.calories,
    meal.protein, meal.carbs, meal.fat, meal.sugar,
    id, userId
  ];

  try {
    await pool.query(query, values);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Error (Update Meal):", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete Meal
app.delete('/api/meals/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query; 

  try {
    await pool.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Error (Delete Meal):", err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


// --- AI Routes ---

app.post('/api/analyze/image', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image data required' });
  }

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
                   - Only set confidence to 0 if it is clearly non-food.
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

// --- Serve Frontend ---
const DIST_PATH = path.join(__dirname, '../dist');
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Only start listening if run directly
if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}