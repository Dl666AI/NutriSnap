# Integration Tests

This directory contains integration tests for the NutriSnap server, organized by functionality.

## Directory Structure

```
tests/
├── integration/
│   ├── helpers.js           # Shared test utilities and helper functions
│   ├── database.test.js     # Database connection tests
│   ├── api-crud.test.js     # API CRUD operation tests
│   └── ai-estimation.test.js # AI estimation tests
└── integration.test.js      # [DEPRECATED] Original monolithic test file
```

## Test Files

### helpers.js
Shared utilities used across all test files:
- `logTestResult()` - Logs test results with timestamps
- `logError()` - Logs detailed error information
- `generateTestId()` - Creates unique test identifiers
- `createTestUser()` - Generates test user data
- `createTestMeal()` - Generates test meal data
- `validateNutritionResponse()` - Validates AI response structure
- `validateRange()` - Validates values are within expected ranges

### database.test.js
**4 tests** covering database connectivity:
- Pool connection and client acquisition
- Table existence verification (users, meals)
- Health endpoint (`/api/health`)
- Debug connection endpoint (`/api/debug/connection`)

### api-crud.test.js
**4 tests** covering meal CRUD operations:
- `POST /api/meals` - Create new meal
- `GET /api/meals` - Retrieve user's meals
- `PUT /api/meals/:id` - Update existing meal
- `DELETE /api/meals/:id` - Delete meal

### ai-estimation.test.js
**3 tests** covering AI nutrition estimation:
- Text analysis with 3 food descriptions (chicken & rice, cookie, salad)
- Invalid input handling (empty description)
- Missing image handling

## Running Tests

### Run All Tests
```bash
cd server
npm test
```

### Run Specific Test File
```bash
# Database tests only
npx jest tests/integration/database.test.js

# API CRUD tests only
npx jest tests/integration/api-crud.test.js

# AI estimation tests only
npx jest tests/integration/ai-estimation.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Output

Each test file produces detailed console output:
- 🔍 Progress indicators
- ✅/❌ Pass/fail status with timestamps
- 📊 Detailed validation results
- 🤖 AI response data
- 📝 Database query results

## Test Isolation

Each test file:
- Uses unique test IDs (timestamp-based)
- Cleans up after itself in `afterAll` hooks
- Closes database pool connections
- Can run independently or as part of the full suite

## Adding New Tests

1. **Create new test file** in `tests/integration/`
2. **Import helpers** from `./helpers.js`
3. **Follow naming convention**: `feature-name.test.js`
4. **Include cleanup** in `afterAll` hook
5. **Add detailed logging** using helper functions

Example:
```javascript
import request from 'supertest';
import { app, pool } from '../../index.js';
import { logTestResult, logError } from './helpers.js';

describe('Feature Tests', () => {
  test('Should do something', async () => {
    const testName = 'Feature Test';
    try {
      console.log('\n🔍 Testing feature...');
      // Test code here
      logTestResult(testName, true, { details: 'success' });
      expect(true).toBe(true);
    } catch (error) {
      logError(testName, error);
      throw error;
    }
  });

  afterAll(async () => {
    await pool.end();
  });
});
```

## Troubleshooting

### Tests fail with "Cannot find module"
**Solution**: Ensure you're running tests from the `server` directory:
```bash
cd server && npm test
```

### Database connection errors
**Solution**: 
1. Check server is running: `npm run dev`
2. Verify database credentials in `server/.env`
3. Test connection manually: `curl http://localhost:3000/api/health`

### AI tests timeout
**Solution**: 
- Check API key is valid in `server/.env`
- Increase timeout in `jest.config.js` if needed
- Verify internet connection for API calls

## Migration Notes

The original `integration.test.js` file has been split into:
- `database.test.js` - Database connection tests (4 tests)
- `api-crud.test.js` - CRUD operation tests (4 tests)
- `ai-estimation.test.js` - AI estimation tests (3 tests)

The original file is kept for reference but is no longer used. You can safely delete it after verifying all tests pass.
