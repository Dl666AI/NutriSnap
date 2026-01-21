import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError, validateNutritionResponse, validateRange } from './helpers.js';

// AI test cases with expected results
const textTestCases = [
    {
        description: 'grilled chicken breast with rice',
        expectedFields: ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'confidence'],
        minCalories: 300,
        maxCalories: 600,
        minProtein: 30,
        testName: 'Simple protein meal'
    },
    {
        description: 'chocolate chip cookie',
        expectedFields: ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'confidence'],
        minCalories: 100,
        maxCalories: 300,
        minSugar: 5,
        testName: 'Sweet snack'
    },
    {
        description: 'caesar salad with dressing',
        expectedFields: ['name', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'confidence'],
        minCalories: 200,
        maxCalories: 500,
        testName: 'Salad with dressing'
    }
];

describe('AI Estimation Tests', () => {

    test('AI Text Analysis - Should return structured nutrition data', async () => {
        const testName = 'AI Text Analysis - All Test Cases';
        console.log('\n🤖 Testing AI text analysis endpoint...\n');

        let allPassed = true;
        const results = [];

        for (const testCase of textTestCases) {
            try {
                console.log(`\n📝 Test Case: ${testCase.testName}`);
                console.log(`Input: "${testCase.description}"`);

                const res = await request(app)
                    .post('/api/analyze/text')
                    .send({ description: testCase.description })
                    .timeout(10000); // 10 second timeout for AI calls

                console.log('Response Status:', res.status);

                if (res.status !== 200) {
                    console.error('❌ Failed with status:', res.status);
                    console.error('Error:', res.body);
                    allPassed = false;
                    results.push({ testCase: testCase.testName, passed: false, error: res.body });
                    continue;
                }

                console.log('AI Response:', JSON.stringify(res.body, null, 2));

                // Validate structure and types
                const validation = validateNutritionResponse(res.body);
                if (!validation.valid) {
                    console.error('❌', validation.error);
                    if (validation.missingFields) {
                        console.error('Missing:', validation.missingFields);
                    }
                    allPassed = false;
                    results.push({ testCase: testCase.testName, passed: false, ...validation });
                    continue;
                }

                // Validate ranges
                let rangeValid = true;

                if (testCase.minCalories || testCase.maxCalories) {
                    const calorieCheck = validateRange(
                        res.body.calories,
                        testCase.minCalories,
                        testCase.maxCalories,
                        'Calories'
                    );
                    if (!calorieCheck.valid) {
                        console.warn(`⚠️  ${calorieCheck.error}`);
                        rangeValid = false;
                    }
                }

                if (testCase.minProtein) {
                    const proteinCheck = validateRange(
                        res.body.protein,
                        testCase.minProtein,
                        undefined,
                        'Protein'
                    );
                    if (!proteinCheck.valid) {
                        console.warn(`⚠️  ${proteinCheck.error}`);
                        rangeValid = false;
                    }
                }

                if (testCase.minSugar) {
                    const sugarCheck = validateRange(
                        res.body.sugar,
                        testCase.minSugar,
                        undefined,
                        'Sugar'
                    );
                    if (!sugarCheck.valid) {
                        console.warn(`⚠️  ${sugarCheck.error}`);
                        rangeValid = false;
                    }
                }

                if (rangeValid) {
                    console.log('✅ All validations passed');
                    console.log(`   Name: ${res.body.name}`);
                    console.log(`   Calories: ${res.body.calories} kcal`);
                    console.log(`   Protein: ${res.body.protein}g, Carbs: ${res.body.carbs}g, Fat: ${res.body.fat}g, Sugar: ${res.body.sugar}g`);
                    console.log(`   Confidence: ${res.body.confidence}%`);
                }

                results.push({
                    testCase: testCase.testName,
                    passed: rangeValid,
                    response: res.body
                });

                if (!rangeValid) allPassed = false;

            } catch (error) {
                console.error(`❌ Error in test case "${testCase.testName}":`, error.message);
                logError(testCase.testName, error);
                allPassed = false;
                results.push({ testCase: testCase.testName, passed: false, error: error.message });
            }
        }

        console.log('\n📊 AI Text Analysis Summary:');
        results.forEach(r => {
            console.log(`  ${r.passed ? '✅' : '❌'} ${r.testCase}`);
        });

        logTestResult(testName, allPassed, { results });

        expect(allPassed).toBe(true);
    });

    test('AI Text Analysis - Should handle invalid input gracefully', async () => {
        const testName = 'AI Text Analysis - Invalid Input';
        try {
            console.log('\n🔍 Testing AI with empty description...');

            const res = await request(app)
                .post('/api/analyze/text')
                .send({ description: '' });

            console.log('Response Status:', res.status);
            console.log('Response Body:', res.body);

            logTestResult(testName, res.status === 400, {
                status: res.status,
                error: res.body.error
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Description required');
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    test('AI Image Analysis - Should handle missing image', async () => {
        const testName = 'AI Image Analysis - Missing Image';
        try {
            console.log('\n🔍 Testing AI image endpoint without image...');

            const res = await request(app)
                .post('/api/analyze/image')
                .send({});

            console.log('Response Status:', res.status);
            console.log('Response Body:', res.body);

            logTestResult(testName, res.status === 400, {
                status: res.status,
                error: res.body.error
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Image required');
        } catch (error) {
            logError(testName, error);
            throw error;
        }
    });

    // Close pool after AI tests
    afterAll(async () => {
        await pool.end();
        console.log('✅ Database pool closed');
    });
});
