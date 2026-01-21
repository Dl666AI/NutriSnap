
import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError, generateTestId, createTestUser } from './helpers.js';

const TEST_USER_ID = generateTestId('profile_test');

// Exact stats we want to verify persistence for
const INITIAL_STATS = {
    weight: 70.5,
    height: 175,
    dailyCalories: 2100,
    dailyProtein: 160,
    dailyCarbs: 220,
    dailySugar: 45,
    goal: 'LOSS_WEIGHT'
};

const UPDATE_STATS = {
    weight: 68.0,
    height: 175, // Height shouldn't change
    dailyCalories: 2000, // Reduced calories
    dailyProtein: 160,
    dailyCarbs: 200,
    dailySugar: 40,
    goal: 'LOSS_WEIGHT'
};

const initialUser = {
    ...createTestUser(TEST_USER_ID),
    ...INITIAL_STATS
};

describe('User Profile Persistence Tests', () => {

    beforeAll(async () => {
        // Ensure clean slate
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
        } catch (e) { }
    });

    afterAll(async () => {
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
            await pool.end();
        } catch (e) {
            console.error('Cleanup error', e);
        }
    });

    test('1. Create user with stats and verify persistence', async () => {
        const testName = 'Create Profile';
        try {
            console.log('\nTesting Profile Creation...');

            // 1. Create (Login/Sync)
            const res = await request(app)
                .post('/api/users')
                .send(initialUser);

            expect(res.status).toBe(200);

            // 2. Immediate Verify via GET
            const getRes = await request(app).get(`/api/users/${TEST_USER_ID}`);

            console.log('Fetched Profile:', {
                weight: getRes.body.weight,
                height: getRes.body.height,
                goal: getRes.body.goal
            });

            // STRICT Check
            expect(Number(getRes.body.weight)).toBe(INITIAL_STATS.weight);
            expect(Number(getRes.body.height)).toBe(INITIAL_STATS.height);
            expect(getRes.body.goal).toBe(INITIAL_STATS.goal);
            expect(getRes.body.dailyCalories).toBe(INITIAL_STATS.dailyCalories);

            logTestResult(testName, true, {
                savedWeight: getRes.body.weight
            });

        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('2. Update user stats and verify changes persist', async () => {
        const testName = 'Update Profile';
        try {
            console.log('\nTesting Profile Update...');

            const updatedUser = {
                ...initialUser,
                ...UPDATE_STATS
            };

            // 1. Update (Sync)
            const res = await request(app)
                .post('/api/users')
                .send(updatedUser);

            expect(res.status).toBe(200);

            // 2. Verify Persistence
            const getRes = await request(app).get(`/api/users/${TEST_USER_ID}`);

            console.log('Fetched Updated Profile:', {
                weight: getRes.body.weight,
                expected: UPDATE_STATS.weight
            });

            expect(Number(getRes.body.weight)).toBe(UPDATE_STATS.weight);
            expect(getRes.body.dailyCalories).toBe(UPDATE_STATS.dailyCalories);

            logTestResult(testName, true, {
                newWeight: getRes.body.weight
            });

        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });
});
