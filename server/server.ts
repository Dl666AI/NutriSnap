import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Robust Environment Loading ---
dotenv.config();
if (!process.env.DB_HOST && process.env.NODE_ENV !== 'production') {
    console.log("DB_HOST not found in current dir, checking parent directory...");
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Import routes (NEW: Using refactored route layer)
import userRoutes from './routes/user.routes';
import mealRoutes from './routes/meal.routes';

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

console.log("--- Server Starting ---");
console.log(`Current Directory: ${process.cwd()}`);
console.log(`Script Directory: ${__dirname}`);
console.log(`Environment Port: ${process.env.PORT}`);
console.log(`Resolved Port: ${PORT}`);

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Health Check Routes ---
app.get('/api/ping', (req: Request, res: Response) => {
    res.json({ message: 'pong', timestamp: Date.now() });
});

app.get('/api/health', async (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// --- API Routes (NEW: Using refactored route layer) ---
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);

// --- 404 & Static Fallback ---

// 1. If we are here, no API route matched.
app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: "API Route not found", path: req.path });
});

// 2. Serve Frontend (Production)
const DIST_PATH = path.join(__dirname, '../dist');
console.log(`Serving static files from: ${DIST_PATH}`);

if (fs.existsSync(DIST_PATH)) {
    // Serve static assets with caching (1yr)
    app.use(express.static(DIST_PATH, {
        maxAge: '1y',
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) {
                // Never cache index.html so users always get the latest version
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
        }
    }));

    // Fallback for SPA routing - also no-cache
    app.get('*', (req: Request, res: Response) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(DIST_PATH, 'index.html'));
    });
} else {
    console.error(`❌ Dist folder missing at ${DIST_PATH}! Frontend will not load.`);
    app.get('*', (req: Request, res: Response) => {
        res.status(500).send("Server Error: Frontend assets missing. Deployment failed.");
    });
}

// Global Error Handler to prevent crashes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
    });
}
