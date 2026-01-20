import request from 'supertest';
import { app, pool } from '../index.js';

// Generate unique IDs for testing to avoid collision
const TEST_TIMESTAMP = Date.now();
const TEST_USER_ID = `test_user_${TEST_TIMESTAMP}`;
const TEST_MEAL_ID = `test_meal_${TEST_TIMESTAMP}`;

const testUser = {
  id: TEST_USER_ID,
  name: 'Integration Test User',
  email: `test_${TEST_TIMESTAMP}@example.com`,
  photoUrl: null,
  height: 175,
  weight: 70,
  dateOfBirth: '1990-01-01',
  gender: 'male',
  goal: 'LOSS_WEIGHT',
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 200,
  dailySugar: 50
};

const testMeal = {
  id: TEST_MEAL_ID,
  name: 'Test Avocado Toast',
  time: '08:00 AM',
  date: '2024-01-01',
  type: 'Breakfast',
  calories: 350,
  protein: 10,
  carbs: 40,
  fat: 15,
  sugar: 2,
  imageUrl: null
};

describe('API Integration Tests', () => {

  // Run once before all tests
  beforeAll(async () => {
    // We need to ensure a user exists first because of Foreign Key constraints on the Meals table
    const res = await request(app)
      .post('/api/users')
      .send(testUser);
    
    if (res.status !== 200) {
      console.error("Failed to setup test user:", res.body);
      throw new Error("Could not create test user");
    }
  });

  // Cleanup after tests
  afterAll(async () => {
    // Delete the test meal (if it still exists)
    await pool.query('DELETE FROM meals WHERE user_id = $1', [TEST_USER_ID]);
    // Delete the test user
    await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER_ID]);
    // Close the pool connection to allow Jest to exit
    await pool.end();
  });

  test('POST /api/meals - Create a new meal', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send({
        userId: TEST_USER_ID,
        meal: testMeal
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_MEAL_ID);
    expect(res.body.name).toBe(testMeal.name);
    expect(res.body.calories).toBe(testMeal.calories);
  });

  test('GET /api/meals - Retrieve meals for user', async () => {
    const res = await request(app)
      .get(`/api/meals?userId=${TEST_USER_ID}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Check if our specific meal is there
    const found = res.body.find(m => m.id === TEST_MEAL_ID);
    expect(found).toBeTruthy();
    expect(found.name).toBe(testMeal.name);
  });

  test('PUT /api/meals/:id - Update an existing meal', async () => {
    const updatedName = 'Updated Avocado Toast';
    const updatedCalories = 400;

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

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the update by fetching again from DB directly or via API
    const checkRes = await request(app).get(`/api/meals?userId=${TEST_USER_ID}`);
    const found = checkRes.body.find(m => m.id === TEST_MEAL_ID);
    expect(found.name).toBe(updatedName);
    expect(found.calories).toBe(updatedCalories);
  });

  test('DELETE /api/meals/:id - Delete a meal', async () => {
    const res = await request(app)
      .delete(`/api/meals/${TEST_MEAL_ID}?userId=${TEST_USER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const checkRes = await request(app).get(`/api/meals?userId=${TEST_USER_ID}`);
    const found = checkRes.body.find(m => m.id === TEST_MEAL_ID);
    expect(found).toBeUndefined();
  });
});
