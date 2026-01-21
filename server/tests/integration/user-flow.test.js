import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError, generateTestId, createTestUser } from './helpers.js';

const TEST_USER_ID = generateTestId('user_flow');
// Create a user with specific stats to verify persistence
const testUser = {
    ...createTestUser(TEST_USER_ID),
    weight: 75.5,
    height: 180,
    dailyCalories: 2500,
    dailyProtein: 180,
    dailyCarbs: 250,
    dailySugar: 40,
    goal: 'GAIN_MUSCLE'
};

describe('User Flow Integration Tests', () => {

    // Cleanup before running to ensure clean state
    beforeAll(async () => {
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
        } catch (e) {
            // Ignore error if user doesn't exist
        }
    });

    afterAll(async () => {
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
            await pool.end();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    test('POST /api/users - Helper: Sync User (Login)', async () => {
        const testName = 'Sync User';
        try {
            console.log('\n🔍 Testing user sync (login/create)...');

            const res = await request(app)
                .post('/api/users')
                .send(testUser);

            console.log('Sync Response Status:', res.status);

            logTestResult(testName, res.status === 200, {
                userId: res.body.id,
                savedWeight: res.body.weight
            });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(TEST_USER_ID);
            expect(Number(res.body.weight)).toBe(testUser.weight);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('GET /api/users/:id - Helper: Fetch User (Re-login)', async () => {
        const testName = 'Fetch User';
        try {
            console.log('\n🔍 Testing user fetch (re-login)...');

            const res = await request(app)
                .get(`/api/users/${TEST_USER_ID}`);

            console.log('Fetch Response Status:', res.status);
            console.log('Fetched User Stats:', {
                weight: res.body.weight,
                height: res.body.height,
                calories: res.body.dailyCalories
            });

            const matches =
                Number(res.body.weight) === testUser.weight &&
                Number(res.body.height) === testUser.height &&
                res.body.dailyCalories === testUser.dailyCalories;

            logTestResult(testName, res.status === 200 && matches, {
                fetchedId: res.body.id,
                statsMatch: matches
            });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(TEST_USER_ID);
            expect(Number(res.body.weight)).toBe(testUser.weight);
            expect(Number(res.body.height)).toBe(testUser.height);
            expect(res.body.goal).toBe(testUser.goal);
            // Verify targets
            expect(res.body.dailyCalories).toBe(testUser.dailyCalories);
            expect(res.body.dailyProtein).toBe(testUser.dailyProtein);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });
});
