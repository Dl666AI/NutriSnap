import { z } from 'zod';

/**
 * SHARED SCHEMA: USER PROFILE
 * Matches the 'users' table in GCP PostgreSQL.
 */

// 1. Raw Database Row (snake_case)
// NOTE: PostgreSQL returns Date objects for DATE and TIMESTAMP columns
export interface DbUser {
    id: string;
    email: string;
    name: string;
    gender: string | null;
    date_of_birth: string | Date | null;  // PostgreSQL may return Date object
    height: number | null;
    weight: number | string | null; // Numeric often returns as string
    goal: string | null;
    photo_url: string | null;
    daily_calories: number | null;
    daily_protein: number | null;
    daily_carbs: number | null;
    daily_sugar: number | null;
    created_at: string | Date | null;   // PostgreSQL may return Date object
    updated_at: string | Date | null;   // PostgreSQL may return Date object
}

/**
 * Helper: Convert Date object or string to ISO string format
 * Handles PostgreSQL Date objects and ISO strings
 */
const formatDateOrTimestamp = (dateValue: string | Date | null | undefined): string | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
        return dateValue.toISOString();
    }
    return String(dateValue);
};

// 2. Runtime Validation & Transformation (Zod)
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().min(1),
    gender: z.string().max(10).nullable().optional(),
    dateOfBirth: z.string().nullable().optional(),
    height: z.number().int().nullable().optional(),
    // Transform numeric weight to a number
    weight: z.preprocess((val) => (val === null ? null : Number(val)), z.number().nullable().optional()),
    goal: z.string().max(20).nullable().optional(),
    photoUrl: z.string().url().nullable().optional(),

    // Daily Targets
    dailyCalories: z.number().int().nullable().optional(),
    dailyProtein: z.number().int().nullable().optional(),
    dailyCarbs: z.number().int().nullable().optional(),
    dailySugar: z.number().int().nullable().optional(),

    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
});

// 3. Clean Application Type
export type User = z.infer<typeof UserSchema>;

/**
 * 4. Mapping Utility
 * Converts raw DB rows (snake_case) to clean app objects (camelCase)
 * CRITICAL: Handles PostgreSQL Date objects by converting to strings
 */
export const mapDbToUser = (dbRow: DbUser): User => {
    return UserSchema.parse({
        id: dbRow.id,
        email: dbRow.email,
        name: dbRow.name,
        gender: dbRow.gender,
        dateOfBirth: formatDateOrTimestamp(dbRow.date_of_birth),
        height: dbRow.height,
        weight: dbRow.weight,
        goal: dbRow.goal,
        photoUrl: dbRow.photo_url,
        dailyCalories: dbRow.daily_calories,
        dailyProtein: dbRow.daily_protein,
        dailyCarbs: dbRow.daily_carbs,
        dailySugar: dbRow.daily_sugar,
        createdAt: formatDateOrTimestamp(dbRow.created_at),
        updatedAt: formatDateOrTimestamp(dbRow.updated_at),
    });
};