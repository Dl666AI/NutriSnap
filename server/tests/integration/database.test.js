import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError } from './helpers.js';

describe('Database Connection Tests', () => {

    test('DB Connection - Pool should be connected', async () => {
        const testName = 'Database Pool Connection';
        try {
            console.log('\n🔍 Testing database pool connection...');
            const client = await pool.connect();
            console.log('✅ Successfully acquired client from pool');

            const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
            console.log('Database Time:', result.rows[0].current_time);
            console.log('PostgreSQL Version:', result.rows[0].pg_version);

            client.release();
            console.log('✅ Client released back to pool');

            logTestResult(testName, true, {
                currentTime: result.rows[0].current_time,
                version: result.rows[0].pg_version
            });

            expect(result.rows[0]).toHaveProperty('current_time');
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('DB Connection - Tables should exist', async () => {
        const testName = 'Database Tables Existence';
        try {
            console.log('\n🔍 Checking if required tables exist...');

            const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'meals')
        ORDER BY table_name;
      `;

            const result = await pool.query(tablesQuery);
            const tableNames = result.rows.map(row => row.table_name);

            console.log('Found tables:', tableNames);

            const hasUsers = tableNames.includes('users');
            const hasMeals = tableNames.includes('meals');

            if (hasUsers) console.log('✅ users table exists');
            else console.error('❌ users table NOT found');

            if (hasMeals) console.log('✅ meals table exists');
            else console.error('❌ meals table NOT found');

            logTestResult(testName, hasUsers && hasMeals, { tables: tableNames });

            expect(hasUsers).toBe(true);
            expect(hasMeals).toBe(true);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('DB Connection - Health endpoint should report connection status', async () => {
        const testName = 'Health Endpoint';
        try {
            console.log('\n🔍 Testing /api/health endpoint...');

            const res = await request(app).get('/api/health');

            console.log('Health Status:', res.body.status);
            console.log('DB Init Error:', res.body.dbInitError || 'None');

            logTestResult(testName, res.status === 200 && res.body.status === 'ok', {
                status: res.body.status,
                dbInitError: res.body.dbInitError
            });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.dbInitError).toBeNull();
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('DB Connection - Debug endpoint should show connection details', async () => {
        const testName = 'Debug Connection Endpoint';
        try {
            console.log('\n🔍 Testing /api/debug/connection endpoint...');

            const res = await request(app).get('/api/debug/connection');

            console.log('Connection Status:', res.body.status);
            console.log('Connection Config:', res.body.config);

            if (res.body.status === 'success') {
                console.log('✅ Database connection successful');
                console.log('Server IP:', res.body.server_ip || 'Unix socket (no IP)');
            } else {
                console.error('❌ Database connection failed');
                console.error('Error:', res.body.message);
            }

            logTestResult(testName, res.body.status === 'success', {
                status: res.body.status,
                config: res.body.config,
                message: res.body.message
            });

            expect(res.body.status).toBe('success');
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    // Close pool after all database tests
    afterAll(async () => {
        await pool.end();
        console.log('✅ Database pool closed');
    });
});
