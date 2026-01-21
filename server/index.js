import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Robust Environment Loading ---
dotenv.config();
// In production/docker, .env might not exist or be injected via cloud env vars
// We skip checking parent directory in strict production to avoid permission errors
if (!process.env.DB_HOST && process.env.NODE_ENV !== 'production') {
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
// Cloud Run injects PORT (8080), ensure we use it
const PORT = process.env.PORT || 3000;

console.log("--- Server Starting ---");
console.log(`Current Directory: ${process.cwd()}`);
console.log(`Script Directory: ${__dirname}`);
console.log(`Environment Port: ${process.env.PORT}`);
console.log(`Resolved Port: ${PORT}`);

// --- Database Connection ---
// Cloud Run + Cloud SQL: Use Unix socket when INSTANCE_CONNECTION_NAME is set
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;

const dbConfig = instanceConnectionName
  ? {
    // Cloud Run with Cloud SQL Unix Socket
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: `/cloudsql/${instanceConnectionName}`,
    // No port or SSL needed for Unix socket
  }
  : {
    // Local development with TCP/IP
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1'
      ? { rejectUnauthorized: false }
      : false,
    connectionTimeoutMillis: 5000,
  };

console.log(`DB Connection Mode: ${instanceConnectionName ? 'Cloud SQL Socket' : 'TCP/IP'}`);

export const pool = new Pool(dbConfig);
let dbInitError = null;

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

const initDb = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query(INIT_SQL);
      console.log("✅ Database tables initialized");
      dbInitError = null;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ DB Init Failed:", err.message);
    dbInitError = err.message;
  }
};

// Check DB Connection on Start (Non-blocking)
pool.connect((err, client, release) => {
  if (err) {
    console.error('⚠️ Warning: Initial DB Connection Failed:', err.message);
    dbInitError = err.message;
  } else {
    console.log('✅ Connected to PostgreSQL');
    initDb();
    release();
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Gemini
// We allow a fallback key to prevent server crash on startup if key is missing
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

// --- ROUTES ---

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: Date.now() });
});

app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', dbInitError });
});

app.get('/api/debug/connection', async (req, res) => {
  // Try connecting with a fresh client to test current config
  const client = new pg.Client(dbConfig);
  try {
    await client.connect();
    const resSql = await client.query('SELECT inet_server_addr() as ip');
    await client.end();

    res.json({
      status: 'success',
      message: 'Connected',
      server_ip: resSql.rows[0].ip,
      config: { host: dbConfig.host, user: dbConfig.user }
    });
  } catch (err) {
    // Return JSON error, not 500 HTML
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code,
      config: { host: dbConfig.host }
    });
  }
});

// --- DATA ROUTES ---

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, name, email, photo_url as "photoUrl", height, weight, 
              date_of_birth as "dateOfBirth", gender, goal, 
              daily_calories as "dailyCalories", daily_protein as "dailyProtein", 
              daily_carbs as "dailyCarbs", daily_sugar as "dailySugar"
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const user = req.body;

  // Use COALESCE in the UPDATE clause to preserve existing values if the new ones are null/undefined.
  // This prevents accidental wiping of stats if the client sends a partial user object.
  const query = `
    INSERT INTO users (id, name, email, photo_url, height, weight, date_of_birth, gender, goal, daily_calories, daily_protein, daily_carbs, daily_sugar)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, 
      email = EXCLUDED.email, 
      photo_url = EXCLUDED.photo_url, 
      height = COALESCE(EXCLUDED.height, users.height), 
      weight = COALESCE(EXCLUDED.weight, users.weight),
      date_of_birth = COALESCE(EXCLUDED.date_of_birth, users.date_of_birth), 
      gender = COALESCE(EXCLUDED.gender, users.gender), 
      goal = COALESCE(EXCLUDED.goal, users.goal), 
      daily_calories = COALESCE(EXCLUDED.daily_calories, users.daily_calories),
      daily_protein = COALESCE(EXCLUDED.daily_protein, users.daily_protein), 
      daily_carbs = COALESCE(EXCLUDED.daily_carbs, users.daily_carbs), 
      daily_sugar = COALESCE(EXCLUDED.daily_sugar, users.daily_sugar), 
      updated_at = NOW()
    RETURNING *;
  `;
  const values = [user.id, user.name, user.email, user.photoUrl, user.height, user.weight, user.dateOfBirth || null, user.gender, user.goal, user.dailyCalories, user.dailyProtein, user.dailyCarbs, user.dailySugar];
  try {
    // --- DEBUG LOGGING ---
    console.log(`[API] POST /api/users received for ID: ${user.id}`);
    console.log(`[API] Payload:`, JSON.stringify(user, null, 2));

    const result = await pool.query(query, values);

    console.log(`[API] User UPSERT Result:`, result.rows[0]);
    // ---------------------

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/api/meals', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const result = await pool.query(`SELECT id, name, meal_time as "time", meal_date::text as "date", type, calories, protein, carbs, fat, sugar, image_url as "imageUrl" FROM meals WHERE user_id = $1 ORDER BY meal_date DESC, meal_time DESC`, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/api/meals', async (req, res) => {
  const { userId, meal } = req.body;
  if (!userId || !meal) return res.status(400).json({ error: 'Missing data' });

  // Don't crash if DB insert fails
  try {
    // Lazy user creation
    const userCheck = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (userCheck.rowCount === 0) {
      await pool.query('INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, 'Unknown User']);
    }

    let imageUrl = meal.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:')) imageUrl = null;

    const query = `INSERT INTO meals (id, user_id, name, meal_time, meal_date, type, calories, protein, carbs, fat, sugar, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
    const values = [meal.id, userId, meal.name, meal.time, meal.date, meal.type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.sugar, imageUrl];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Add Meal Failed:", err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.put('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, meal } = req.body;
    const query = `UPDATE meals SET name=$1, meal_time=$2, meal_date=$3, type=$4, calories=$5, protein=$6, carbs=$7, fat=$8, sugar=$9 WHERE id = $10 AND user_id = $11 RETURNING *;`;
    const values = [meal.name, meal.time, meal.date, meal.type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.sugar, id, userId];
    await pool.query(query, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.delete('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    await pool.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// --- AI Routes ---
app.post('/api/analyze/image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });
    const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, {
          text: `Identify this food item. Estimate calories and macros for a standard serving.
                 - Always make a best-effort guess, even for packaged goods or unclear images.
                 - Set confidence to 100 if you can identify ANY food, drink, or food packaging.
                 - Only set confidence to 0 if the image is clearly a non-food object (like a shoe) or pitch black.
                 Return strictly JSON.` }]
      },
      config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
    });
    if (response.text) res.json(JSON.parse(response.text));
    else res.status(500).json({ error: "Empty AI response" });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI failed", details: error.message });
  }
});

app.post('/api/analyze/text', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{
          text: `Analyze this food description: "${description}". 
                 Estimate calories and macros.
                 - Always provide a result if the text describes something edible.
                 - Set confidence to 100 for any valid food description.
                 - Only set confidence to 0 for complete gibberish.
                 Return strictly JSON.` }]
      },
      config: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
    });
    if (response.text) res.json(JSON.parse(response.text));
    else res.status(500).json({ error: "Empty AI response" });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI failed", details: error.message });
  }
});

// --- 404 & Static Fallback ---

// 1. If we are here, no API route matched.
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: "API Route not found", path: req.path });
});

// 2. Serve Frontend (Production)
// We look for ../dist because we are running in /app/server
const DIST_PATH = path.join(__dirname, '../dist');
console.log(`Serving static files from: ${DIST_PATH}`);

if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
} else {
  console.error(`❌ Dist folder missing at ${DIST_PATH}! Frontend will not load.`);
  app.get('*', (req, res) => {
    res.status(500).send("Server Error: Frontend assets missing. Deployment failed.");
  });
}

// Global Error Handler to prevent crashes
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
  });
}