import { MealRepository } from '../repositories/meal.repo';
import { MealEntry, mapDbToMealEntry, DbMealEntry } from '../src/shared/meal_entries_schema';

/**
 * SERVICE: Meal Entries
 * Goal: Business logic layer that transforms raw DB data into clean app data.
 * This layer uses repositories to fetch data, then applies Zod mappers.
 * 
 * Industry Standard: This is where business logic lives (filtering, sorting, calculations).
 */
export class MealService {
    private mealRepo: MealRepository;

    constructor() {
        this.mealRepo = new MealRepository();
    }

    /**
     * Get all meal entries (clean application types).
     * @returns Array of MealEntry (camelCase, validated)
     */
    async getAllMeals(): Promise<MealEntry[]> {
        const dbMeals = await this.mealRepo.findAll();
        return dbMeals.map(mapDbToMealEntry);
    }

    /**
     * Get all meals for a specific user.
     * @param userId - The user's ID
     * @returns Array of MealEntry
     */
    async getMealsByUserId(userId: string): Promise<MealEntry[]> {
        const dbMeals = await this.mealRepo.findByUserId(userId);
        return dbMeals.map(mapDbToMealEntry);
    }

    /**
     * Get a single meal by ID.
     * @param id - The meal entry ID
     * @returns MealEntry or null if not found
     */
    async getMealById(id: string): Promise<MealEntry | null> {
        const dbMeal = await this.mealRepo.findById(id);
        return dbMeal ? mapDbToMealEntry(dbMeal) : null;
    }

    /**
     * Get meals for a specific user and date.
     * @param userId - The user's ID
     * @param mealDate - The date in YYYY-MM-DD format
     * @returns Array of MealEntry
     */
    async getMealsByUserIdAndDate(userId: string, mealDate: string): Promise<MealEntry[]> {
        const dbMeals = await this.mealRepo.findByUserIdAndDate(userId, mealDate);
        return dbMeals.map(mapDbToMealEntry);
    }

    /**
     * BUSINESS LOGIC: Get meals for a user within the last N days.
     * @param userId - The user's ID
     * @param days - Number of days to look back (default: 7)
     * @returns Array of MealEntry from the last N days
     */
    async getMealsForLastNDays(userId: string, days: number = 7): Promise<MealEntry[]> {
        const allMeals = await this.getMealsByUserId(userId);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return allMeals.filter(meal => {
            const mealDate = new Date(meal.mealDate);
            return mealDate >= cutoffDate;
        });
    }

    /**
     * BUSINESS LOGIC: Calculate total nutrition for a specific date.
     * @param userId - The user's ID
     * @param date - The date in YYYY-MM-DD format
     * @returns Totals for calories, protein, carbs, fat, sugar
     */
    async getDailyTotals(userId: string, date: string): Promise<{
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFat: number;
        totalSugar: number;
    }> {
        const meals = await this.getMealsByUserIdAndDate(userId, date);

        return meals.reduce((totals, meal) => ({
            totalCalories: totals.totalCalories + meal.calories,
            totalProtein: totals.totalProtein + meal.protein,
            totalCarbs: totals.totalCarbs + meal.carbs,
            totalFat: totals.totalFat + meal.fat,
            totalSugar: totals.totalSugar + meal.sugar,
        }), {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalSugar: 0,
        });
    }

    /**
     * Create a new meal entry.
     * @param mealData - Meal data in application format (camelCase)
     * @param userId - The user's ID
     * @returns The newly created MealEntry
     */
    async createMeal(mealData: {
        name: string;
        mealType: string;
        mealTime: string;
        mealDate: string;
        calories: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        sugar?: number;
        imageUrl?: string | null;
    }, userId: string): Promise<MealEntry> {
        // Convert camelCase to snake_case for database
        const dbMealData: Omit<DbMealEntry, 'id' | 'created_at'> = {
            user_id: userId,
            name: mealData.name,
            meal_type: mealData.mealType,         // App: mealType -> DB: meal_type
            meal_time: mealData.mealTime,
            meal_date: mealData.mealDate,
            calories: mealData.calories,
            protein_g: mealData.protein ?? 0,     // App: protein -> DB: protein_g
            carbs_g: mealData.carbs ?? 0,         // App: carbs -> DB: carbs_g
            fat_g: mealData.fat ?? 0,             // App: fat -> DB: fat_g
            sugar_g: mealData.sugar ?? 0,         // App: sugar -> DB: sugar_g
            image_url: this.sanitizeImageUrl(mealData.imageUrl),
            notes: null,
        };

        const dbMeal = await this.mealRepo.create(dbMealData);
        return mapDbToMealEntry(dbMeal);
    }

    /**
     * Update an existing meal entry.
     * @param id - The meal entry ID
     * @param updates - Partial meal data to update
     * @returns The updated MealEntry or null if not found
     */
    async updateMeal(id: string, updates: Partial<{
        name: string;
        mealType: string;
        mealTime: string;
        mealDate: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        sugar: number;
        imageUrl: string | null;
    }>): Promise<MealEntry | null> {
        // Convert camelCase to snake_case for database
        const dbUpdates: Partial<Omit<DbMealEntry, 'id' | 'user_id' | 'created_at'>> = {};

        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
        if (updates.mealTime !== undefined) dbUpdates.meal_time = updates.mealTime;
        if (updates.mealDate !== undefined) dbUpdates.meal_date = updates.mealDate;
        if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
        if (updates.protein !== undefined) dbUpdates.protein_g = updates.protein;
        if (updates.carbs !== undefined) dbUpdates.carbs_g = updates.carbs;
        if (updates.fat !== undefined) dbUpdates.fat_g = updates.fat;
        if (updates.sugar !== undefined) dbUpdates.sugar_g = updates.sugar;
        if (updates.imageUrl !== undefined) dbUpdates.image_url = this.sanitizeImageUrl(updates.imageUrl);

        const dbMeal = await this.mealRepo.update(id, dbUpdates);
        return dbMeal ? mapDbToMealEntry(dbMeal) : null;
    }

    /**
     * Delete a meal entry.
     * @param id - The meal entry ID
     * @returns True if deleted, false if not found
     */
    async deleteMeal(id: string): Promise<boolean> {
        return await this.mealRepo.delete(id);
    }

    /**
     * BUSINESS LOGIC: Sanitize image URL (reject data URLs).
     * @param imageUrl - The image URL
     * @returns Sanitized URL or null
     */
    private sanitizeImageUrl(imageUrl: string | null | undefined): string | null {
        if (!imageUrl) return null;
        // Reject base64 data URLs (too large for DB)
        if (imageUrl.startsWith('data:')) return null;
        return imageUrl;
    }
}
