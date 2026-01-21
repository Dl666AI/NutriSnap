import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult } from './helpers.js';

// Test user that simulates the problematic production state
const TEST_USER_EMPTY_STRINGS = {
    id: 'empty_string_test_' + Date.now(),
    name: 'Empty String Test User',
    email: 'empty_test@example.com',
    photoUrl: 'https://example.com/photo.jpg'
};

describe('Empty String Sanitization Tests', () => {

    beforeAll(async () => {
        // Ensure clean state
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id]);
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id]);
    });

    test('1. Server sanitizes empty strings on initial user creation', async () => {
        console.log('\n🧪 Testing empty string sanitization on create...');

        // Simulate frontend sending a user with empty strings (the problematic case)
        const userWithEmptyStrings = {
            ...TEST_USER_EMPTY_STRINGS,
            height: '',  // Empty string
            weight: '',  // Empty string
            dateOfBirth: '',
            gender: '',
            goal: '',
            dailyCalories: '',
            dailyProtein: '',
            dailyCarbs: '',
            dailySugar: ''
        };

        const createResponse = await request(app)
            .post('/api/users')
            .send(userWithEmptyStrings)
            .expect(200);

        console.log('Created user response:', createResponse.body);

        // Verify that empty strings were converted to NULL in the database
        const dbCheck = await pool.query('SELECT * FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id]);
        const dbUser = dbCheck.rows[0];

        console.log('DB state after create:', {
            height: dbUser.height,
            weight: dbUser.weight,
            dateOfBirth: dbUser.date_of_birth,
            goal: dbUser.goal
        });

        // All these should be NULL, not empty strings
        expect(dbUser.height).toBeNull();
        expect(dbUser.weight).toBeNull();
        expect(dbUser.date_of_birth).toBeNull();
        expect(dbUser.gender).toBeNull();
        expect(dbUser.goal).toBeNull();

        logTestResult('Empty String Sanitization - Create', true, {
            emptyStringsConvertedToNull: true
        });
    });

    test('2. Server sanitizes invalid values (empty strings, 0, NaN) on update', async () => {
        console.log('\n🧪 Testing sanitization of invalid values...');

        // First create a valid user
        const validUser = {
            id: TEST_USER_EMPTY_STRINGS.id + '_sanitize',
            name: 'Sanitize Test User',
            email: 'sanitize@example.com',
            height: 180,
            weight: 75,
            dateOfBirth: '1990-01-01',
            gender: 'male',
            goal: 'GAIN_MUSCLE',
            dailyCalories: 2500,
            dailyProtein: 180,
            dailyCarbs: 250,
            dailySugar: 40
        };

        await request(app)
            .post('/api/users')
            .send(validUser)
            .expect(200);

        // Now send an update with invalid values (empty strings, 0, etc)
        const invalidUpdate = {
            id: TEST_USER_EMPTY_STRINGS.id + '_sanitize',
            name: 'Sanitize Test User',
            email: 'sanitize@example.com',
            height: '', // Empty string - should become NULL
            weight: 0, // Zero - should become NULL (invalid weight)
            dateOfBirth: '', // Empty string
            gender: '', // Empty string
            goal: '', // Empty string
            dailyCalories: 'not a number', // Invalid number
            dailyProtein: NaN,
            dailyCarbs: null,
            dailySugar: undefined
        };

        const sanitizeResponse = await request(app)
            .post('/api/users')
            .send(invalidUpdate)
            .expect(200);

        console.log('Sanitized response:', {
            height: sanitizeResponse.body.height,
            weight: sanitizeResponse.body.weight,
            goal: sanitizeResponse.body.goal
        });

        // Verify DB - COALESCE should have preserved the original valid values
        const dbCheck = await pool.query('SELECT * FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id + '_sanitize']);
        const dbUser = dbCheck.rows[0];

        console.log('DB state after invalid update (should preserve original VALUES via COALESCE):', {
            height: dbUser.height,
            weight: dbUser.weight,
            goal: dbUser.goal
        });

        // COALESCE(NULL, users.column) = original value (preserved!)
        expect(Number(dbUser.height)).toBe(180); // Original value preserved
        expect(Number(dbUser.weight)).toBe(75); // Original value preserved
        expect(dbUser.goal).toBe('GAIN_MUSCLE'); // Original value preserved

        logTestResult('Invalid Value Sanitization', true, {
            emptyStringsBlocked: true,
            zeroBlocked: true,
            originalDataPreserved: true
        });

        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id + '_sanitize']);
    });

    test('3. Server preserves existing valid data when receiving empty strings', async () => {
        console.log('\n🧪 Testing that COALESCE preserves valid existing data...');

        // First, create a user with valid data
        const validUser = {
            id: TEST_USER_EMPTY_STRINGS.id + '_preserve',
            name: 'Preserve Test User',
            email: 'preserve@example.com',
            height: 175,
            weight: 70,
            dateOfBirth: '1995-05-15',
            gender: 'female',
            goal: 'LOSS_WEIGHT',
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 225,
            dailySugar: 50
        };

        await request(app)
            .post('/api/users')
            .send(validUser)
            .expect(200);

        // Now sync with undefined/empty values (simulating a partial update from frontend)
        const partialUpdate = {
            id: TEST_USER_EMPTY_STRINGS.id + '_preserve',
            name: 'Preserve Test User',
            email: 'preserve@example.com',
            photoUrl: 'https://newphoto.com/pic.jpg',
            // These are missing/undefined (would become NULL after sanitization)
            height: undefined,
            weight: undefined,
            dateOfBirth: undefined,
            gender: undefined,
            goal: undefined
        };

        await request(app)
            .post('/api/users')
            .send(partialUpdate)
            .expect(200);

        // Verify the original valid data was preserved
        const dbCheck = await pool.query('SELECT * FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id + '_preserve']);
        const dbUser = dbCheck.rows[0];

        console.log('DB state after partial update:', {
            height: dbUser.height,
            weight: dbUser.weight,
            dateOfBirth: dbUser.date_of_birth,
            goal: dbUser.goal,
            photoUrl: dbUser.photo_url
        });

        // Original data should be preserved (COALESCE worked)
        expect(Number(dbUser.height)).toBe(175);
        expect(Number(dbUser.weight)).toBe(70);
        expect(dbUser.gender).toBe('female');
        expect(dbUser.goal).toBe('LOSS_WEIGHT');
        // But new photoUrl should be updated
        expect(dbUser.photo_url).toBe('https://newphoto.com/pic.jpg');

        logTestResult('Data Preservation - COALESCE', true, {
            originalDataPreserved: true,
            newPhotoUrlUpdated: true
        });

        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_EMPTY_STRINGS.id + '_preserve']);
    });
});
