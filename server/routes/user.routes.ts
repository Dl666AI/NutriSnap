import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';

/**
 * CONTROLLER/ROUTES: User Profile
 * Goal: Handle HTTP request/response. Keep this layer THIN.
 * This layer doesn't know about databases - it only knows how to talk to the Service.
 * 
 * Industry Standard: No business logic here. Just validate input, call service, return response.
 */

const router = Router();
const userService = new UserService();

/**
 * GET /api/users/:userId/weight-history
 * Get weight history for a user
 */
router.get('/:userId/weight-history', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const history = await userService.getWeightHistory(userId);
        res.json(history);
    } catch (err: any) {
        console.error('[GET /api/users/:userId/weight-history] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * GET /api/users/:id
 * Get a user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err: any) {
        console.error('[GET /api/users/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * POST /api/users
 * Create or update a user (upsert)
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.id || !userData.email || !userData.name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['id', 'email', 'name']
            });
        }

        console.log('[POST /api/users] Original payload:', JSON.stringify(userData, null, 2));

        // Call service layer (handles sanitization and mapping)
        const user = await userService.upsertUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            height: userData.height,
            weight: userData.weight,
            goal: userData.goal,
            photoUrl: userData.photoUrl,
            dailyCalories: userData.dailyCalories,
            dailyProtein: userData.dailyProtein,
            dailyCarbs: userData.dailyCarbs,
            dailySugar: userData.dailySugar,
        });

        console.log('[POST /api/users] Upsert result:', user);
        res.json(user);
    } catch (err: any) {
        console.error('[POST /api/users] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * PUT /api/users/:id
 * Update an existing user
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await userService.updateUser(id, updates);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err: any) {
        console.error('[PUT /api/users/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await userService.deleteUser(id);

        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true });
    } catch (err: any) {
        console.error('[DELETE /api/users/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * GET /api/users
 * Get all users (admin/debug)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err: any) {
        console.error('[GET /api/users] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

export default router;
