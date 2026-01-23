# 🚀 Local Development Guide

## Running NutriSnap Locally

This guide will help you run both the **client (frontend)** and **server (backend)** on localhost for development and testing.

---

## Prerequisites

1. ✅ Node.js (>= 18.0.0) installed
2. ✅ PostgreSQL database connection configured in `.env`
3. ✅ Dependencies installed (`npm install` in both root and `server/` directories)

---

## 🎯 Quick Start (Running Both Client & Server)

### Option 1: Using the NEW TypeScript Server (Recommended)

**Terminal 1 - Server (TypeScript):**
```bash
cd server
npm run dev:ts
```
> Server will run on: **http://localhost:3000**

**Terminal 2 - Client (Vite + React):**
```bash
# From the root directory
npm run dev
```
> Client will run on: **http://localhost:5173** (or the next available port)

---

### Option 2: Using the OLD JavaScript Server (Legacy)

**Terminal 1 - Server (JavaScript):**
```bash
cd server
npm run dev
```
> Server will run on: **http://localhost:3000**

**Terminal 2 - Client (Vite + React):**
```bash
# From the root directory
npm run dev
```
> Client will run on: **http://localhost:5173**

---

## 📋 Step-by-Step Instructions

### Step 1: Install Dependencies

If you haven't already, install dependencies for both client and server:

```bash
# Install client dependencies (from root)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment Variables

Make sure you have a `.env` file in the **root directory** with:

```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_HOST=your_host_or_localhost
DB_PORT=5432
API_KEY=your_google_ai_api_key
```

### Step 3: Start the Server

Open a new terminal and run:

```bash
cd server
npm run dev:ts    # For TypeScript (recommended)
# OR
npm run dev       # For legacy JavaScript
```

**Expected output:**
```
--- Server Starting ---
✅ Connected to PostgreSQL
🚀 Server listening on 0.0.0.0:3000
```

### Step 4: Start the Client

Open another terminal and run:

```bash
# From the root directory
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open in Browser

Navigate to: **http://localhost:5173**

---

## 🔧 Available Commands

### Client (from root directory)
```bash
npm run dev      # Start dev server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Server (from server/ directory)

#### TypeScript (New, Recommended)
```bash
npm run dev:ts     # Start TypeScript server with auto-reload
npm run build      # Compile TypeScript to JavaScript
npm run start:ts   # Run compiled TypeScript server
```

#### JavaScript (Legacy)
```bash
npm run dev        # Start JavaScript server with auto-reload
npm start          # Start JavaScript server (no auto-reload)
```

---

## 🐛 Troubleshooting

### Server won't start
- **Check database connection**: Make sure PostgreSQL is running and `.env` has correct credentials
- **Port already in use**: Kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

### Client won't start
- **Port already in use**: Kill the process using port 5173:
  ```bash
  lsof -ti:5173 | xargs kill -9
  ```
- **Dependencies missing**: Run `npm install` in the root directory

### Client can't connect to server
- **Make sure server is running first** on port 3000
- **Check CORS settings**: The server has CORS enabled by default
- **Check API proxy**: Vite config should proxy `/api` requests to `http://localhost:3000`

### Database connection errors
- Verify `.env` file exists and has correct values
- Test database connection:
  ```bash
  psql -h YOUR_HOST -U YOUR_USER -d YOUR_DATABASE
  ```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│  Browser (localhost:5173)              │
│  - React + Vite                        │
│  - Frontend UI                         │
└─────────────┬───────────────────────────┘
              │ HTTP Requests (/api/*)
              ↓
┌─────────────────────────────────────────┐
│  Server (localhost:3000)               │
│  - Express + TypeScript                │
│  - Routes → Services → Repositories    │
└─────────────┬───────────────────────────┘
              │ SQL Queries
              ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Database                   │
│  - Tables: users, meal_entries         │
└─────────────────────────────────────────┘
```

---

## 🎉 You're All Set!

Once both servers are running:
1. The **client** will hot-reload when you edit React components
2. The **server** will auto-restart when you edit server files (with `dev:ts` or `dev`)
3. Changes will reflect immediately in your browser

Happy coding! 🚀
