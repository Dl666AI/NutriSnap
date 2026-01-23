import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.DB_HOST) {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

/**
 * GCP Cloud SQL Database Connector
 * Features: Connection Pooling, SSL Encryption, and Startup Validation.
 */

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,

    // Pooling settings
    max: 10,                 // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection

    // SSL Configuration for GCP Cloud SQL
    // Required if your GCP instance has "Allow only SSL connections" enabled.
    ssl: isProduction ? {
        rejectUnauthorized: false, // Set to true if you provide the server-ca.pem
        ca: fs.readFileSync(path.join(__dirname, '../../certs/server-ca.pem')).toString(),
        key: fs.readFileSync(path.join(__dirname, '../../certs/client-key.pem')).toString(),
        cert: fs.readFileSync(path.join(__dirname, '../../certs/client-cert.pem')).toString(),
    } : false, // Disable SSL for local dev unless you've set up local certificates
};

const pool = new Pool(poolConfig);

// Diagnostic: Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.stack);
        process.exit(1); // Crash the server if the DB is unreachable
    } else {
        console.log('✅ Connected to PostgreSQL on GCP:', res.rows[0].now);
    }
});

// Error handling for the pool itself
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

export default pool;