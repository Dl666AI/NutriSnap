import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError, generateTestId, createTestUser, createTestMeal } from './helpers.js';

// Generate unique IDs for this test suite
const TEST_USER_ID = generateTestId('user');
const TEST_MEAL_ID = generateTestId('meal');

const testUser = createTestUser(TEST_USER_ID);
const testMeal = createTestMeal(TEST_MEAL_ID);

describe('API CRUD Tests', () => {

    // Setup: Create test user before all tests
    beforeAll(async () => {
        console.log('\n🔧 Setting up test user for CRUD tests...');
        try {
            const res = await request(app)
                .post('/api/users')
                .send(testUser);

            if (res.status !== 200) {
                console.error("❌ Failed to setup test user:", res.body);
                throw new Error("Could not create test user");
            }
            console.log('✅ Test user created:', TEST_USER_ID);
        } catch (error) {
            logError('CRUD Test Setup', error);
            throw error;
        }
    });

    // Cleanup: Remove test data after all tests
    afterAll(async () => {
        console.log('\n🧹 Cleaning up CRUD test data...');
        try {
            await pool.query('DELETE FROM meals WHERE user_id = $1', [TEST_USER_ID]);
            console.log('✅ Deleted test meals');

            await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
            console.log('✅ Deleted test user');

            await pool.end();
            console.log('✅ Database pool closed');
        } catch (error) {
            console.error('❌ Cleanup error:', error.message);
        }
    });

    test('POST /api/meals - Create a new meal', async () => {
        const testName = 'Create Meal';
        try {
            console.log('\n🔍 Testing meal creation...');

            const res = await request(app)
                .post('/api/meals')
                .send({
                    userId: TEST_USER_ID,
                    meal: testMeal
                });

            console.log('Response Status:', res.status);
            console.log('Created Meal:', res.body);

            logTestResult(testName, res.status === 200, {
                mealId: res.body.id,
                mealName: res.body.name
            });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(TEST_MEAL_ID);
            expect(res.body.name).toBe(testMeal.name);
            expect(res.body.calories).toBe(testMeal.calories);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('GET /api/meals - Retrieve meals for user', async () => {
        const testName = 'Retrieve Meals';
        try {
            console.log('\n🔍 Testing meal retrieval...');

            const res = await request(app)
                .get(`/api/meals?userId=${TEST_USER_ID}`);

            console.log('Response Status:', res.status);
            console.log('Number of meals:', res.body.length);

            const found = res.body.find(m => m.id === TEST_MEAL_ID);
            if (found) {
                console.log('✅ Found test meal:', found.name);
            } else {
                console.error('❌ Test meal not found in results');
            }

            logTestResult(testName, res.status === 200 && found, {
                totalMeals: res.body.length,
                foundTestMeal: !!found
            });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(found).toBeTruthy();
            expect(found.name).toBe(testMeal.name);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('PUT /api/meals/:id - Update an existing meal', async () => {
        const testName = 'Update Meal';
        const updatedName = 'Updated Avocado Toast';
        const updatedCalories = 400;

        try {
            console.log('\n🔍 Testing meal update...');
            console.log('Updating to:', { name: updatedName, calories: updatedCalories });

            const res = await request(app)
                .put(`/api/meals/${TEST_MEAL_ID}`)
                .send({
                    userId: TEST_USER_ID,
                    meal: {
                        ...testMeal,
                        name: updatedName,
                        calories: updatedCalories
                    }
                });

            console.log('Update Response Status:', res.status);

            // Verify the update
            const checkRes = await request(app).get(`/api/meals?userId=${TEST_USER_ID}`);
            const found = checkRes.body.find(m => m.id === TEST_MEAL_ID);

            if (found) {
                console.log('✅ Meal updated successfully');
                console.log('New values:', { name: found.name, calories: found.calories });
            } else {
                console.error('❌ Updated meal not found');
            }

            logTestResult(testName, res.status === 200 && found.name === updatedName, {
                updatedName: found?.name,
                updatedCalories: found?.calories
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(found.name).toBe(updatedName);
            expect(found.calories).toBe(updatedCalories);
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('DELETE /api/meals/:id - Delete a meal', async () => {
        const testName = 'Delete Meal';
        try {
            console.log('\n🔍 Testing meal deletion...');

            const res = await request(app)
                .delete(`/api/meals/${TEST_MEAL_ID}?userId=${TEST_USER_ID}`);

            console.log('Delete Response Status:', res.status);

            // Verify deletion
            const checkRes = await request(app).get(`/api/meals?userId=${TEST_USER_ID}`);
            const found = checkRes.body.find(m => m.id === TEST_MEAL_ID);

            if (!found) {
                console.log('✅ Meal deleted successfully');
            } else {
                console.error('❌ Meal still exists after deletion');
            }

            logTestResult(testName, res.status === 200 && !found, {
                deleted: !found
            });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(found).toBeUndefined();
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });
});
