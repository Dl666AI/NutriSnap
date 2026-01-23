import { Router, Request, Response } from 'express';
import { MealService } from '../services/meal.service';
import { UserService } from '../services/user.service';

/**
 * CONTROLLER/ROUTES: Meal Entries
 * Goal: Handle HTTP request/response. Keep this layer THIN.
 * This layer doesn't know about databases - it only knows how to talk to the Service.
 * 
 * Industry Standard: No business logic here. Just validate input, call service, return response.
 */

const router = Router();
const mealService = new MealService();
const userService = new UserService();

/**
 * GET /api/meals?userId=xxx
 * Get all meals for a user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid userId parameter' });
        }

        const meals = await mealService.getMealsByUserId(userId);

        // Transform to match existing API format (for backward compatibility)
        const formattedMeals = meals.map(meal => ({
            id: meal.id,
            name: meal.name,
            time: meal.mealTime,
            date: meal.mealDate,
            type: meal.mealType,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            sugar: meal.sugar,
            imageUrl: meal.imageUrl,
        }));

        res.json(formattedMeals);
    } catch (err: any) {
        console.error('[GET /api/meals] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * GET /api/meals/:id
 * Get a single meal by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const meal = await mealService.getMealById(id);

        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json(meal);
    } catch (err: any) {
        console.error('[GET /api/meals/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * POST /api/meals
 * Create a new meal entry
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, meal } = req.body;

        if (!userId || !meal) {
            return res.status(400).json({ error: 'Missing data', required: ['userId', 'meal'] });
        }

        // Validate required meal fields
        if (!meal.name || !meal.time || !meal.date || !meal.type) {
            return res.status(400).json({
                error: 'Missing required meal fields',
                required: ['name', 'time', 'date', 'type']
            });
        }

        // Ensure user exists (lazy creation)
        await userService.ensureUserExists(userId);

        // Create meal using service layer
        const createdMeal = await mealService.createMeal({
            name: meal.name,
            mealType: meal.type,
            mealTime: meal.time,
            mealDate: meal.date,
            calories: meal.calories ?? 0,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            sugar: meal.sugar,
            imageUrl: meal.imageUrl,
        }, userId);

        // Transform to match existing API format (for backward compatibility)
        const response = {
            id: createdMeal.id,
            name: createdMeal.name,
            meal_time: createdMeal.mealTime,
            meal_date: createdMeal.mealDate,
            type: createdMeal.mealType,
            calories: createdMeal.calories,
            protein: createdMeal.protein,
            carbs: createdMeal.carbs,
            fat: createdMeal.fat,
            sugar: createdMeal.sugar,
            image_url: createdMeal.imageUrl,
        };

        res.json(response);
    } catch (err: any) {
        console.error('[POST /api/meals] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * PUT /api/meals/:id
 * Update an existing meal entry
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { meal } = req.body;

        if (!meal) {
            return res.status(400).json({ error: 'Missing meal data' });
        }

        const updatedMeal = await mealService.updateMeal(id, {
            name: meal.name,
            mealType: meal.type,
            mealTime: meal.time,
            mealDate: meal.date,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            sugar: meal.sugar,
            imageUrl: meal.imageUrl,
        });

        if (!updatedMeal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json({ success: true });
    } catch (err: any) {
        console.error('[PUT /api/meals/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * DELETE /api/meals/:id
 * Delete a meal entry
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await mealService.deleteMeal(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json({ success: true });
    } catch (err: any) {
        console.error('[DELETE /api/meals/:id] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

/**
 * GET /api/meals/stats/daily?userId=xxx&date=YYYY-MM-DD
 * Get daily nutrition totals for a specific date
 */
router.get('/stats/daily', async (req: Request, res: Response) => {
    try {
        const { userId, date } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid userId parameter' });
        }

        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid date parameter (YYYY-MM-DD)' });
        }

        const totals = await mealService.getDailyTotals(userId, date);
        res.json(totals);
    } catch (err: any) {
        console.error('[GET /api/meals/stats/daily] Error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

export default router;
