// Shared test utilities and helper functions

// Helper function to log test results
export const logTestResult = (testName, passed, details = {}) => {
    const timestamp = new Date().toISOString();
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n[${timestamp}] ${status}: ${testName}`);
    if (Object.keys(details).length > 0) {
        console.log('Details:', JSON.stringify(details, null, 2));
    }
};

// Helper function to log errors
export const logError = (testName, error, response = null) => {
    console.error(`\n❌ ERROR in ${testName}:`);
    console.error('Error Message:', error.message);
    if (error.stack) {
        console.error('Stack Trace:', error.stack);
    }
    if (response) {
        console.error('Response Status:', response.status);
        console.error('Response Body:', JSON.stringify(response.body, null, 2));
    }
};

// Generate unique test identifiers
export const generateTestId = (prefix = 'test') => {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}`;
};

// Create test user data
export const createTestUser = (userId) => ({
    id: userId,
    name: 'Integration Test User',
    email: `test_${Date.now()}@example.com`,
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
});

// Create test meal data
export const createTestMeal = (mealId) => ({
    id: mealId,
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
});

// Validate nutrition response structure
export const validateNutritionResponse = (response) => {
    const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'confidence'];

    // Check all fields exist
    const hasAllFields = requiredFields.every(field =>
        response.hasOwnProperty(field)
    );

    if (!hasAllFields) {
        const missingFields = requiredFields.filter(f => !response.hasOwnProperty(f));
        return { valid: false, error: 'Missing fields', missingFields };
    }

    // Check data types
    const validTypes =
        typeof response.name === 'string' &&
        typeof response.calories === 'number' &&
        typeof response.protein === 'number' &&
        typeof response.carbs === 'number' &&
        typeof response.fat === 'number' &&
        typeof response.sugar === 'number' &&
        typeof response.confidence === 'number';

    if (!validTypes) {
        return { valid: false, error: 'Invalid data types' };
    }

    return { valid: true };
};

// Validate value is within range
export const validateRange = (value, min, max, fieldName) => {
    if (min !== undefined && value < min) {
        return { valid: false, error: `${fieldName} (${value}) below minimum (${min})` };
    }
    if (max !== undefined && value > max) {
        return { valid: false, error: `${fieldName} (${value}) above maximum (${max})` };
    }
    return { valid: true };
};
