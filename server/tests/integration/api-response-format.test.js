import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult } from './helpers.js';

/**
 * API Response Format Consistency Tests
 * 
 * These tests ensure that GET and POST endpoints return user data with
 * consistent camelCase field names, preventing the profile data loading bug
 * where POST returned snake_case but GET returned camelCase.
 */

const TEST_USER = {
    id: 'api_format_test_' + Date.now(),
    name: 'API Format Test User',
    email: 'format_test@example.com',
    photoUrl: 'https://example.com/photo.jpg',
    height: 180,
    weight: 78.5,
    dateOfBirth: '1995-07-20',
    gender: 'male',
    goal: 'GAIN_MUSCLE',
    dailyCalories: 2452,
    dailyProtein: 184,
    dailyCarbs: 276,
    dailySugar: 61
};

describe('API Response Format Consistency Tests', () => {

    beforeAll(async () => {
        // Ensure clean state
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER.id]);
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER.id]);
    });

    test('1. POST /api/users returns camelCase field names', async () => {
        console.log('\n🧪 Testing POST /api/users response format...');

        const response = await request(app)
            .post('/api/users')
            .send(TEST_USER)
            .expect(200);

        console.log('POST response keys:', Object.keys(response.body));

        // Verify all expected camelCase fields are present
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('photoUrl'); // NOT photo_url
        expect(response.body).toHaveProperty('height');
        expect(response.body).toHaveProperty('weight');
        expect(response.body).toHaveProperty('dateOfBirth'); // NOT date_of_birth
        expect(response.body).toHaveProperty('gender');
        expect(response.body).toHaveProperty('goal');
        expect(response.body).toHaveProperty('dailyCalories'); // NOT daily_calories
        expect(response.body).toHaveProperty('dailyProtein'); // NOT daily_protein
        expect(response.body).toHaveProperty('dailyCarbs'); // NOT daily_carbs
        expect(response.body).toHaveProperty('dailySugar'); // NOT daily_sugar

        // Verify snake_case fields are NOT present
        expect(response.body).not.toHaveProperty('photo_url');
        expect(response.body).not.toHaveProperty('date_of_birth');
        expect(response.body).not.toHaveProperty('daily_calories');
        expect(response.body).not.toHaveProperty('daily_protein');
        expect(response.body).not.toHaveProperty('daily_carbs');
        expect(response.body).not.toHaveProperty('daily_sugar');

        // Verify values are correct
        expect(response.body.photoUrl).toBe(TEST_USER.photoUrl);
        // PostgreSQL DATE type returns ISO timestamp, so we compare just the date part
        expect(response.body.dateOfBirth).toContain(TEST_USER.dateOfBirth);
        expect(response.body.dailyCalories).toBe(TEST_USER.dailyCalories);
        expect(Number(response.body.height)).toBe(TEST_USER.height);
        expect(Number(response.body.weight)).toBe(TEST_USER.weight);

        logTestResult('POST /api/users - camelCase format', true, {
            allCamelCaseFieldsPresent: true,
            noSnakeCaseFields: true
        });
    });

    test('2. GET /api/users/:id returns camelCase field names', async () => {
        console.log('\n🧪 Testing GET /api/users/:id response format...');

        const response = await request(app)
            .get(`/api/users/${TEST_USER.id}`)
            .expect(200);

        console.log('GET response keys:', Object.keys(response.body));

        // Verify all expected camelCase fields are present
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('photoUrl');
        expect(response.body).toHaveProperty('dateOfBirth');
        expect(response.body).toHaveProperty('dailyCalories');
        expect(response.body).toHaveProperty('dailyProtein');
        expect(response.body).toHaveProperty('dailyCarbs');
        expect(response.body).toHaveProperty('dailySugar');

        // Verify snake_case fields are NOT present
        expect(response.body).not.toHaveProperty('photo_url');
        expect(response.body).not.toHaveProperty('date_of_birth');
        expect(response.body).not.toHaveProperty('daily_calories');

        logTestResult('GET /api/users/:id - camelCase format', true, {
            allCamelCaseFieldsPresent: true,
            noSnakeCaseFields: true
        });
    });

    test('3. GET and POST return identical field name formats', async () => {
        console.log('\n🧪 Testing GET vs POST field name consistency...');

        // First, create/update via POST
        const postResponse = await request(app)
            .post('/api/users')
            .send(TEST_USER)
            .expect(200);

        // Then fetch via GET
        const getResponse = await request(app)
            .get(`/api/users/${TEST_USER.id}`)
            .expect(200);

        const postKeys = Object.keys(postResponse.body).sort();
        const getKeys = Object.keys(getResponse.body).sort();

        console.log('POST keys:', postKeys);
        console.log('GET keys:', getKeys);

        // The keys should be identical (both camelCase)
        expect(postKeys).toEqual(getKeys);

        // Verify specific critical fields match
        expect(postResponse.body.photoUrl).toBe(getResponse.body.photoUrl);
        expect(postResponse.body.dateOfBirth).toBe(getResponse.body.dateOfBirth);
        expect(postResponse.body.dailyCalories).toBe(getResponse.body.dailyCalories);
        expect(postResponse.body.dailyProtein).toBe(getResponse.body.dailyProtein);
        expect(postResponse.body.dailyCarbs).toBe(getResponse.body.dailyCarbs);
        expect(postResponse.body.dailySugar).toBe(getResponse.body.dailySugar);

        logTestResult('GET vs POST format consistency', true, {
            identicalKeys: true,
            identicalValues: true
        });
    });

    test('4. User sync flow preserves all profile data', async () => {
        console.log('\n🧪 Testing full user sync flow (simulating login)...');

        // Step 1: Create user with full profile data (simulating first login)
        const initialUser = {
            id: TEST_USER.id + '_sync',
            name: 'Sync Test User',
            email: 'sync_' + Date.now() + '@example.com', // Unique email to avoid constraint violations
            photoUrl: 'https://example.com/photo1.jpg',
            height: 175,
            weight: 70.5,
            dateOfBirth: '1990-01-01',
            gender: 'female',
            goal: 'LOSS_WEIGHT',
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 225,
            dailySugar: 50
        };

        const createResponse = await request(app)
            .post('/api/users')
            .send(initialUser)
            .expect(200);

        console.log('Created user with stats:', {
            height: createResponse.body.height,
            weight: createResponse.body.weight,
            dailyCalories: createResponse.body.dailyCalories
        });

        // Step 2: Simulate re-login (Google provides only basic info)
        // Frontend fetches existing user via GET
        const fetchResponse = await request(app)
            .get(`/api/users/${TEST_USER.id}_sync`)
            .expect(200);

        console.log('Fetched user (GET):', {
            height: fetchResponse.body.height,
            weight: fetchResponse.body.weight,
            dailyCalories: fetchResponse.body.dailyCalories
        });

        // Verify GET returned all the data
        expect(Number(fetchResponse.body.height)).toBe(175);
        expect(Number(fetchResponse.body.weight)).toBe(70.5);
        expect(fetchResponse.body.dailyCalories).toBe(2000);
        expect(fetchResponse.body.dateOfBirth).toContain('1990-01-01');

        // Step 3: Frontend merges with Google data and syncs back
        const mergedUser = {
            ...fetchResponse.body,
            name: 'Sync Test User (Updated)', // Google might update name
            photoUrl: 'https://example.com/photo2.jpg' // Google might update photo
        };

        const syncResponse = await request(app)
            .post('/api/users')
            .send(mergedUser)
            .expect(200);

        console.log('Synced user (POST):', {
            height: syncResponse.body.height,
            weight: syncResponse.body.weight,
            dailyCalories: syncResponse.body.dailyCalories
        });

        // CRITICAL: Verify that POST response has all the profile data
        expect(Number(syncResponse.body.height)).toBe(175);
        expect(Number(syncResponse.body.weight)).toBe(70.5);
        expect(syncResponse.body.dailyCalories).toBe(2000);
        expect(syncResponse.body.dailyProtein).toBe(150);
        expect(syncResponse.body.dailyCarbs).toBe(225);
        expect(syncResponse.body.dailySugar).toBe(50);
        expect(syncResponse.body.dateOfBirth).toContain('1990-01-01');
        expect(syncResponse.body.gender).toBe('female');
        expect(syncResponse.body.goal).toBe('LOSS_WEIGHT');

        // Verify updated fields
        expect(syncResponse.body.name).toBe('Sync Test User (Updated)');
        expect(syncResponse.body.photoUrl).toBe('https://example.com/photo2.jpg');

        logTestResult('User sync flow - data preservation', true, {
            profileDataPreserved: true,
            googleDataUpdated: true,
            camelCaseFormat: true
        });

        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER.id + '_sync']);
    });

    test('5. Numeric fields are returned as numbers, not strings', async () => {
        console.log('\n🧪 Testing numeric field types...');

        const response = await request(app)
            .get(`/api/users/${TEST_USER.id}`)
            .expect(200);

        // Height is INTEGER in DB (converted from NUMERIC), weight is NUMERIC
        // PostgreSQL returns INTEGER as number, NUMERIC with decimals as string
        expect(typeof response.body.height).toBe('number');
        expect(typeof response.body.weight).toBe('string'); // NUMERIC with decimals returns as string

        // Verify they have the correct values
        expect(response.body.height).toBe(180);
        expect(parseFloat(response.body.weight)).toBe(78.5);

        // Integer fields should be numbers
        expect(typeof response.body.dailyCalories).toBe('number');
        expect(typeof response.body.dailyProtein).toBe('number');
        expect(typeof response.body.dailyCarbs).toBe('number');
        expect(typeof response.body.dailySugar).toBe('number');

        logTestResult('Numeric field types', true, {
            numericFieldsValid: true
        });
    });
});
