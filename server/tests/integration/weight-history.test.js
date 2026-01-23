
import request from 'supertest';
import { app, pool } from '../../index.js'; // Import from legacy server for testing logic

const TEST_USER = {
    id: 'test_weight_user_' + Date.now(),
    email: 'weight_test@example.com',
    name: 'Weight Tester',
    weight: 70
};

describe('Weight History Feature', () => {

    beforeAll(async () => {
        // Create a test user
        await request(app)
            .post('/api/users')
            .send(TEST_USER);
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM users WHERE id = $1', [TEST_USER.id]);
        await pool.end();
    });

    it('should create a weight history entry when weight is updated', async () => {
        // 1. Update user weight
        const newWeight = 75;
        const resUpdate = await request(app)
            .put(`/api/users/${TEST_USER.id}`)
            .send({ weight: newWeight });

        expect(resUpdate.status).toBe(200);
        expect(Number(resUpdate.body.weight)).toBe(newWeight);

        // 2. Fetch weight history
        const resHistory = await request(app)
            .get(`/api/users/${TEST_USER.id}/weight-history`);

        expect(resHistory.status).toBe(200);
        expect(Array.isArray(resHistory.body)).toBe(true);
        expect(resHistory.body.length).toBeGreaterThanOrEqual(1);

        const latestEntry = resHistory.body[0];
        expect(Number(latestEntry.weight)).toBe(newWeight);
        expect(latestEntry.userId).toBe(TEST_USER.id);
    });
});
