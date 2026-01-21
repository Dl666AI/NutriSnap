export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['**/tests/integration/**/*.test.js'],
    verbose: true,
    testTimeout: 30000, // 30 seconds for AI calls
    collectCoverage: false,
    moduleFileExtensions: ['js', 'json'],
};
