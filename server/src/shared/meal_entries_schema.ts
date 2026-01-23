import { z } from 'zod';

/**
 * SHARED SCHEMA: MEAL ENTRY
 * This file is the source of truth for both the Server and Client.
 * It prevents the "LLM Loophole" by strictly defining data types and names.
 * 
 * NOTE: Column names match the ACTUAL meal_entries table in PostgreSQL
 */

// 1. RAW DATABASE ROW (Exact match to PostgreSQL)
// Use this in your Repositories when fetching data.
export interface DbMealEntry {
    id: string;
    user_id: string;
    name: string;
    meal_type: string;            // 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    meal_time: string;            // TIME format (HH:mm:ss)
    meal_date: string | Date;     // DATE - PostgreSQL may return as Date object
    calories: number | string;    // NUMERIC in PG can come as string
    protein_g: number | string | null;
    carbs_g: number | string | null;
    fat_g: number | string | null;
    sugar_g: number | string | null;
    image_url: string | null;
    notes: string | null;
    created_at: string | null;
}

// 2. RUNTIME VALIDATION (Zod)
// This transforms and validates data as it leaves the database.
export const MealEntrySchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string().min(1),
    mealType: z.string().default('other'),
    mealTime: z.string(),
    mealDate: z.string(),
    // Transform numeric strings from PG into actual JS numbers
    calories: z.preprocess((val) => Number(val) || 0, z.number()),
    protein: z.preprocess((val) => (val === null ? 0 : Number(val) || 0), z.number()),
    carbs: z.preprocess((val) => (val === null ? 0 : Number(val) || 0), z.number()),
    fat: z.preprocess((val) => (val === null ? 0 : Number(val) || 0), z.number()),
    sugar: z.preprocess((val) => (val === null ? 0 : Number(val) || 0), z.number()),
    imageUrl: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

// 3. CLEAN APPLICATION TYPE
// Use this in your Frontend components and Service layers.
export type MealEntry = z.infer<typeof MealEntrySchema>;

/**
 * Helper: Convert Date object or string to YYYY-MM-DD string
 */
const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    // If it's already a string like "2026-01-21T05:00:00.000Z", extract just the date
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
        return dateValue.split('T')[0];
    }
    return String(dateValue);
};

/**
 * 4. THE MAPPING UTILITY
 * This is the "Bug Killer." It converts snake_case DB rows into camelCase App objects.
 */
export const mapDbToMealEntry = (dbRow: DbMealEntry): MealEntry => {
    const result = MealEntrySchema.safeParse({
        id: dbRow.id,
        userId: dbRow.user_id,
        name: dbRow.name,
        mealType: dbRow.meal_type || 'other',   // DB: meal_type -> App: mealType
        mealTime: dbRow.meal_time || '',
        mealDate: formatDate(dbRow.meal_date),   // Convert Date/ISO string to YYYY-MM-DD
        calories: dbRow.calories,
        protein: dbRow.protein_g,                // DB: protein_g -> App: protein
        carbs: dbRow.carbs_g,                    // DB: carbs_g -> App: carbs
        fat: dbRow.fat_g,                        // DB: fat_g -> App: fat
        sugar: dbRow.sugar_g,                    // DB: sugar_g -> App: sugar
        imageUrl: dbRow.image_url,
        notes: dbRow.notes,
    });

    if (!result.success) {
        console.error("Schema Validation Failed for Meal Entry:", result.error.format());
        console.error("Failed row data:", dbRow);
        throw new Error("Invalid data format received from Database.");
    }

    return result.data;
};