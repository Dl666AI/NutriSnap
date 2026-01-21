# NutriSnap - AI-Powered Nutrition Tracking

NutriSnap is a world-class, mobile-first web application designed to simplify nutrition tracking through artificial intelligence. By leveraging computer vision and a seamless user interface, NutriSnap helps users maintain their health goals with minimal friction.

## Project Description

NutriSnap aims to bridge the gap between "wanting to eat healthy" and "actually tracking intake." Traditional apps are tedious; NutriSnap makes logging a meal as simple as snapping a photo. It provides real-time feedback on calories and macronutrients (Protein, Carbs, Fat, Sugar) to help users stay within their daily targets.

### Key Features

*   **AI Vision Logging**: Real-time camera integration to capture and identify meals instantly.
*   **Manual Entry**: Flexibility to log meals without photos, allowing manual input of calories and macros.
*   **Smart Diary**: A chronological record of the day's intake grouped by meal type (Breakfast, Lunch, Dinner, Snack).
*   **Progress Insights**: Visual representation of weekly calorie trends and macronutrient distribution.
*   **Persistent Profile**: User profiles with simulated authentication (Google/Apple) and persistent local storage.
*   **Adaptive Theming**: Full support for Light and Dark modes with system synchronization.

---

## Data Persistence & Limitations

**⚠️ Important Note for Users & Developers**

NutriSnap currently operates as a client-side application using the browser's **Local Storage** to persist data. This has several important implications:

1.  **Device Specificity**: Data is stored *only* on the device and browser where it was created. If you log a meal on your phone, you will not see it on your laptop, even if you log in with the same email.
2.  **Browser Cache**: Clearing your browser's cache, cookies, or local data will **permanently delete** your logs and profile settings.
3.  **Privacy**: Your nutrition data never leaves your device (except for the transient API call to the AI model for image analysis).

**For Developers - Architecture Note:**
The application uses a `StorageAdapter` pattern in `DataContext.tsx`. The current implementation writes to `localStorage` using keys namespaced by User ID (e.g., `nutrisnap_meals_12345`). To upgrade this to a cloud-based solution (like Firebase or PostgreSQL), you simply need to update the `StorageAdapter.load` and `StorageAdapter.save` methods to perform API calls. The rest of the UI is agnostic to the storage medium.

---

## Overall Architecture

NutriSnap follows a modular, component-based architecture built with **React** and **Tailwind CSS**.

### 1. Navigation & Routing
The app uses a **State-Based Router** in `App.tsx` rather than traditional URL routing. This provides a smoother, "app-like" experience by managing a `currentScreen` state. 
*   **Tab System**: Remembers the last active main tab (Home, Diary, Insights, Profile) to return the user there after a flow (like Camera or Manual Entry) is completed or cancelled.

### 2. State Management
*   **DataContext**: Centralized store for the `meals` array. It handles adding/removing entries and computes real-time `totals` (calories, macros) and progress against `targets`.
*   **ThemeContext**: Manages the application's appearance state (Light/Dark/System) and persists the choice to `localStorage`.
*   **Local Persistence**: Both user authentication and nutrition data are mirrored to `localStorage` to ensure data survives page refreshes.

### 3. Component Hierarchy
*   **Screens**: High-level components representing full views (e.g., `HomeScreen`, `CameraScreen`).
*   **UI Components**: Reusable interface elements like `BottomNav`, `MacroCards`, and `AuthSimulation`.
*   **Contexts**: Providers that wrap the application to inject global logic.

### 4. Technical Stack
*   **Frontend**: React 19 (ES6+ Modules).
*   **Styling**: Tailwind CSS via CDN with a customized `tailwind.config`.
*   **Icons**: Material Symbols Outlined for a clean, modern iconography.
*   **Hardware Integration**: Browser `MediaDevices` API for real-time camera access and frame capture.

### 5. Design Language
The design follows a **Sophisticated Nature** aesthetic:
*   **Primary Color**: `#9cab8c` (Sage Green) - evokes health and freshness.
*   **Accent Color**: `#F8DDA4` (Creamy Sand) - provides a warm, organic contrast.
*   **Micro-interactions**: Subtle CSS animations (`float-up`, `breath`, `scan`) and backdrop blurs create a high-end, premium feel.

---

## AI Implementation Roadmap
While currently using high-fidelity mock data for result simulation, the architecture is designed to integrate with the **Google Gemini API**:
1.  **Image-to-Text**: Sending captured base64 frames to `gemini-3-flash-preview`.
2.  **Structured JSON**: Prompting the model to return nutrition data in a structured schema.
3.  **Grounding**: Using search grounding for specialized or branded food items.

---

## Development & Deployment
The project is structured to run directly in a browser environment using ESM imports.
*   **Root**: `index.html`
*   **Entry**: `index.tsx`
*   **Configurations**: `metadata.json` (Permissions) and `tailwind.config` (Theming).

---

## Quick Start Guide

Follow these steps to run NutriSnap locally on your machine.

### Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
3. **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd NutriSnap

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Setup PostgreSQL Database

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14

# Or on Linux
sudo systemctl start postgresql

# Create database (if needed)
createdb nutrisnap

# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
```

### 3. Configure Environment Variables

#### Frontend `.env` (root directory)
```bash
# Create .env file in project root
cat > .env << EOF
API_KEY=your_gemini_api_key_here
EOF
```

#### Backend `server/.env`
```bash
# Create .env file in server directory
cat > server/.env << EOF
API_KEY=your_gemini_api_key_here
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=nutrisnap
DB_HOST=localhost
DB_PORT=5432
EOF
```

> **Note**: Replace `your_gemini_api_key_here` with your actual Gemini API key and `your_postgres_password` with your PostgreSQL password.

### 4. Run the Application

You'll need **two terminal windows** - one for frontend, one for backend.

#### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

**Expected output:**
```
--- Server Starting ---
DB Connection Mode: TCP/IP
✅ Connected to PostgreSQL
✅ Database tables initialized
🚀 Server listening on 0.0.0.0:3000
```

#### Terminal 2: Start Frontend
```bash
# From project root
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the NutriSnap home screen! 🎉

### 6. Run Tests (Optional)

```bash
# In a third terminal
cd server
npm test
```

**Expected output:**
```
Test Suites: 3 passed, 3 total
Tests:       11 passed, 11 total
Time:        ~12s
```

---

## Command Reference

### Development Commands

```bash
# Frontend (from project root)
npm run dev          # Start Vite dev server on port 5173

# Backend (from server directory)
npm run dev          # Start Express server on port 3000
npm start            # Start production server
npm test             # Run integration tests

# Database
pg_isready           # Check PostgreSQL status
psql nutrisnap       # Connect to database
```

### Stopping Services

```bash
# Stop servers: Press Ctrl+C in each terminal

# Stop PostgreSQL (macOS)
brew services stop postgresql@14

# Stop PostgreSQL (Linux)
sudo systemctl stop postgresql
```

---

## Troubleshooting

### Frontend won't start

**Error**: `Cannot find module 'vite'`

**Solution**:
```bash
npm install
```

### Backend won't start

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**: Check PostgreSQL is running
```bash
pg_isready -h localhost -p 5432
# If not running, start it:
brew services start postgresql@14
```

### Database connection fails

**Error**: `password authentication failed`

**Solution**: Update `server/.env` with correct password
```bash
# Test connection manually
psql -h localhost -U postgres -d nutrisnap
```

### API key errors

**Error**: `API key invalid` or `403 Forbidden`

**Solution**: 
1. Get a valid API key from [Google AI Studio](https://aistudio.google.com/)
2. Update both `.env` files (root and `server/.env`)
3. Restart both servers

### Port already in use

**Error**: `Port 3000 is already in use`

**Solution**: Kill the process using the port
```bash
# Find process on port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

---

## Local Development Setup (Advanced)


---

## HOWTO: Use AI Model to Generate Output from Input

NutriSnap uses the **Google Gemini API** (`@google/genai` SDK) to analyze food images and text descriptions, returning structured nutrition data.

### Architecture Overview

The AI integration is implemented in two main locations:
- **Frontend**: `services/GeminiService.ts` - Client-side AI calls (currently unused in production)
- **Backend**: `server/index.js` - Server-side AI endpoints (active in production)

### Server-Side Implementation (Recommended)

The backend provides two AI endpoints that accept input and return structured JSON nutrition data.

#### 1. Image Analysis Endpoint

**Endpoint**: `POST /api/analyze/image`

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "name": "Grilled Chicken Salad",
  "calories": 350,
  "protein": 35,
  "carbs": 20,
  "fat": 12,
  "sugar": 5,
  "confidence": 95
}
```

**Implementation** ([server/index.js:271-295](file:///Users/derrickwluo66/Documents/AI2026/NutriSnap/server/index.js#L271-L295)):
```javascript
app.post('/api/analyze/image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required' });
    
    // Strip data URL prefix to get clean base64
    const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: `Identify this food item. Estimate calories and macros for a standard serving.
                   - Always make a best-effort guess, even for packaged goods or unclear images.
                   - Set confidence to 100 if you can identify ANY food, drink, or food packaging.
                   - Only set confidence to 0 if the image is clearly a non-food object (like a shoe) or pitch black.
                   Return strictly JSON.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: RESPONSE_SCHEMA 
      }
    });
    
    if (response.text) res.json(JSON.parse(response.text));
    else res.status(500).json({ error: "Empty AI response" });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI failed", details: error.message });
  }
});
```

#### 2. Text Analysis Endpoint

**Endpoint**: `POST /api/analyze/text`

**Request Body**:
```json
{
  "description": "Two slices of pepperoni pizza and a coke"
}
```

**Response**:
```json
{
  "name": "Pepperoni Pizza (2 slices) with Coke",
  "calories": 680,
  "protein": 28,
  "carbs": 85,
  "fat": 24,
  "sugar": 42,
  "confidence": 90
}
```

**Implementation** ([server/index.js:297-320](file:///Users/derrickwluo66/Documents/AI2026/NutriSnap/server/index.js#L297-L320)):
```javascript
app.post('/api/analyze/text', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
      config: { 
        responseMimeType: "application/json", 
        responseSchema: RESPONSE_SCHEMA 
      }
    });
    
    if (response.text) res.json(JSON.parse(response.text));
    else res.status(500).json({ error: "Empty AI response" });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI failed", details: error.message });
  }
});
```

### Response Schema

The AI model is constrained to return data matching this schema ([server/index.js:138-150](file:///Users/derrickwluo66/Documents/AI2026/NutriSnap/server/index.js#L138-L150)):

```javascript
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
```

### Testing the AI Endpoints

**Using curl:**
```bash
# Test text analysis
curl -X POST https://nutrisnap-19113468273.us-west1.run.app/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"description": "chicken breast with rice and broccoli"}'

# Test image analysis (with base64 image)
curl -X POST https://nutrisnap-19113468273.us-west1.run.app/api/analyze/image \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,YOUR_BASE64_STRING"}'
```

**Using JavaScript:**
```javascript
// Text analysis
const analyzeText = async (description) => {
  const response = await fetch('/api/analyze/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  return await response.json();
};

// Image analysis
const analyzeImage = async (base64Image) => {
  const response = await fetch('/api/analyze/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
  return await response.json();
};
```

### API Key Configuration

The AI model requires a valid Gemini API key:

**Local Development** (`.env` file):
```env
API_KEY=your_gemini_api_key_here
```

**Cloud Run Deployment**:
```bash
gcloud run services update nutrisnap \
  --region=us-west1 \
  --update-env-vars API_KEY=your_gemini_api_key_here
```

### Best Practices

1. **Always use server-side endpoints** - Keeps API key secure and prevents rate limiting per client
2. **Handle errors gracefully** - AI may fail on invalid images or rate limits
3. **Validate confidence scores** - Use the `confidence` field to warn users about uncertain estimates
4. **Optimize image size** - Compress images before sending to reduce latency and costs
5. **Cache results** - Store AI responses to avoid redundant API calls for the same input

---

## HOWTO: Secure Database Connection in Cloud Run

NutriSnap uses **PostgreSQL** (Cloud SQL) for persistent data storage. Proper configuration is critical for security and reliability.

### Connection Architecture

The server supports two connection modes ([server/index.js:40-60](file:///Users/derrickwluo66/Documents/AI2026/NutriSnap/server/index.js#L40-L60)):

#### 1. **Cloud SQL Unix Socket** (Production - Cloud Run)
- Uses Cloud SQL Proxy built into Cloud Run
- Connects via Unix socket: `/cloudsql/PROJECT:REGION:INSTANCE`
- **No public IP exposure**
- **No SSL configuration needed**
- Requires `INSTANCE_CONNECTION_NAME` environment variable

#### 2. **TCP/IP Connection** (Local Development)
- Connects via public IP or localhost
- Requires SSL for remote connections
- Uses standard PostgreSQL port (5432)
- Requires `DB_HOST` environment variable

### Required Environment Variables

#### For Cloud Run (Production):

```bash
gcloud run services update nutrisnap \
  --region=us-west1 \
  --set-env-vars "\
API_KEY=your_gemini_api_key,\
DB_USER=postgres,\
DB_PASSWORD=your_secure_password,\
DB_NAME=postgres,\
INSTANCE_CONNECTION_NAME=PROJECT_ID:REGION:INSTANCE_NAME,\
NODE_ENV=production"
```

**Critical Variables**:
- `INSTANCE_CONNECTION_NAME` - **Required** for Unix socket mode (e.g., `gen-lang-client-0785046564:us-central1:nutri-user`)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (use strong passwords)
- `DB_NAME` - Database name

#### For Local Development:

Create `server/.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
DB_HOST=localhost
DB_PORT=5432
API_KEY=your_gemini_api_key
```

### Security Best Practices

#### 1. **Never Commit Credentials**
Add to `.gitignore`:
```
.env
server/.env
*.env.local
```

#### 2. **Use Cloud SQL Proxy for Cloud Run**
Ensure Cloud SQL instance is attached via annotation:
```bash
gcloud run services update nutrisnap \
  --region=us-west1 \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME
```

Verify with:
```bash
gcloud run services describe nutrisnap \
  --region=us-west1 \
  --format="value(spec.template.metadata.annotations)"
```

Should show: `run.googleapis.com/cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME`

#### 3. **Use Strong Passwords**
Generate secure passwords:
```bash
openssl rand -base64 32
```

#### 4. **Restrict Database Access**
In Cloud SQL settings:
- **Disable public IP** if only Cloud Run needs access
- Use **Private IP** with VPC connector for production
- Enable **SSL/TLS** for any public IP connections
- Configure **Authorized Networks** to whitelist specific IPs

#### 5. **Use IAM Authentication** (Advanced)
Instead of passwords, use Cloud SQL IAM authentication:
```javascript
const dbConfig = {
  user: 'service-account@project.iam',
  database: 'postgres',
  host: `/cloudsql/${instanceConnectionName}`,
};
```

Enable IAM authentication in Cloud SQL and grant roles:
```bash
gcloud sql users create SERVICE_ACCOUNT_EMAIL \
  --instance=INSTANCE_NAME \
  --type=CLOUD_IAM_SERVICE_ACCOUNT
```

#### 6. **Monitor Connection Health**
Use the built-in health endpoints:

```bash
# Check database initialization status
curl https://nutrisnap-19113468273.us-west1.run.app/api/health

# Test database connection
curl https://nutrisnap-19113468273.us-west1.run.app/api/debug/connection
```

#### 7. **Connection Pooling**
The server uses `pg.Pool` for efficient connection management:
```javascript
export const pool = new Pool(dbConfig);
```

Configure pool limits for production:
```javascript
const pool = new Pool({
  ...dbConfig,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 5000, // Fail fast on connection issues
});
```

### Troubleshooting Connection Issues

#### Problem: "Connection terminated due to connection timeout"

**Cause**: Missing `INSTANCE_CONNECTION_NAME` environment variable

**Solution**:
```bash
gcloud run services update nutrisnap \
  --region=us-west1 \
  --set-env-vars INSTANCE_CONNECTION_NAME=PROJECT:REGION:INSTANCE
```

**Verify** in logs:
```bash
gcloud run services logs read nutrisnap --region=us-west1 --limit=20
```

Should show: `DB Connection Mode: Cloud SQL Socket`

#### Problem: "no PostgreSQL user name specified in startup packet"

**Cause**: `DB_USER` environment variable not set

**Solution**: Add all required environment variables (see above)

#### Problem: "password authentication failed"

**Cause**: Incorrect `DB_PASSWORD`

**Solution**: 
1. Reset password in Cloud SQL console
2. Update environment variable:
```bash
gcloud run services update nutrisnap \
  --region=us-west1 \
  --update-env-vars DB_PASSWORD=new_password
```

#### Problem: "Connection refused" (Local Development)

**Cause**: PostgreSQL not running or wrong host/port

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14
```

### Database Schema Initialization

The server automatically creates tables on startup ([server/index.js:68-116](file:///Users/derrickwluo66/Documents/AI2026/NutriSnap/server/index.js#L68-L116)):

```sql
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
```

### Backup and Recovery

**Enable automated backups** in Cloud SQL:
```bash
gcloud sql instances patch INSTANCE_NAME \
  --backup-start-time=03:00 \
  --enable-bin-log
```

**Create manual backup**:
```bash
gcloud sql backups create \
  --instance=INSTANCE_NAME \
  --description="Pre-deployment backup"
```

---

## Running Integration Tests

The project includes comprehensive integration tests that verify database connectivity, CRUD operations, and AI estimation functionality.

### Prerequisites

1. **Local server must be running** on port 3000
2. **Database must be accessible** (local PostgreSQL or Cloud SQL)
3. **API key must be configured** in `server/.env`

### Running Tests

From the `server` directory:

```bash
cd server
npm test
```

### Test Coverage

The integration test suite includes **11 tests** across 3 categories:

#### 1. Database Connection Tests (4 tests)
- ✅ **Pool Connection** - Verifies PostgreSQL pool can acquire and release clients
- ✅ **Table Existence** - Confirms `users` and `meals` tables are created
- ✅ **Health Endpoint** - Tests `/api/health` returns connection status
- ✅ **Debug Endpoint** - Tests `/api/debug/connection` shows connection details

#### 2. API CRUD Tests (4 tests)
- ✅ **Create Meal** - `POST /api/meals` creates a new meal entry
- ✅ **Retrieve Meals** - `GET /api/meals` fetches user's meals
- ✅ **Update Meal** - `PUT /api/meals/:id` modifies existing meal
- ✅ **Delete Meal** - `DELETE /api/meals/:id` removes meal

#### 3. AI Estimation Tests (3 tests)
- ✅ **Text Analysis** - Tests 3 food descriptions with expected nutrition ranges:
  - "grilled chicken breast with rice" (300-600 kcal, 30g+ protein)
  - "chocolate chip cookie" (100-300 kcal, 10g+ sugar)
  - "caesar salad with dressing" (200-500 kcal)
- ✅ **Invalid Input Handling** - Verifies empty description returns 400 error
- ✅ **Missing Image Handling** - Verifies missing image returns 400 error

### Test Output

Tests include **detailed console logging** with:
- 🔍 Test progress indicators
- ✅/❌ Pass/fail status with timestamps
- 📊 Detailed validation results
- 🤖 AI response data (name, calories, macros, confidence)
- 📝 Database query results

**Example output:**
```
🔍 Testing database pool connection...
✅ Successfully acquired client from pool
Database Time: 2026-01-21T02:09:06.765Z
PostgreSQL Version: PostgreSQL 14.13 on x86_64-pc-linux-gnu
✅ Client released back to pool

[2026-01-21T02:09:06.765Z] ✅ PASS: Database Pool Connection

📝 Test Case: Simple protein meal
Input: "grilled chicken breast with rice"
Response Status: 200
AI Response: {
  "name": "grilled chicken breast with rice",
  "calories": 360,
  "protein": 35,
  "carbs": 42,
  "fat": 4,
  "sugar": 0,
  "confidence": 100
}
✅ All validations passed
   Name: grilled chicken breast with rice
   Calories: 360 kcal
   Protein: 35g, Carbs: 42g, Fat: 4g, Sugar: 0g
   Confidence: 100%
```

### Failed Test Logging

When tests fail, detailed error information is logged:

```
❌ ERROR in Test Name:
Error Message: Connection timeout
Stack Trace: ...
Response Status: 500
Response Body: {
  "error": "Database error",
  "details": "Connection terminated"
}
```

### Test Configuration

**Jest Configuration** (`server/jest.config.js`):
- Test timeout: 30 seconds (for AI API calls)
- Runs tests sequentially (`--runInBand`)
- Verbose output enabled
- ES modules support

**Environment Variables**:
Tests run with `NODE_ENV=test` to prevent conflicts with development server.

### Continuous Integration

To run tests in CI/CD pipelines:

```bash
# Install dependencies
cd server && npm install

# Run tests
npm test

# Exit code 0 = all tests passed
# Exit code 1 = tests failed
```

### Troubleshooting Tests

#### "Connection refused" error
**Cause**: Local server not running

**Solution**:
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Run tests
cd server && npm test
```

#### "API key invalid" error
**Cause**: Missing or invalid Gemini API key

**Solution**: Verify `server/.env` contains valid `API_KEY`

#### "Database error" in tests
**Cause**: Database not accessible

**Solution**: 
1. Check PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Verify credentials in `server/.env`
3. Check `/api/health` endpoint manually

---
