import pool from '../config/db';
import { DbMealEntry } from '../src/shared/meal_entries_schema';

/**
 * REPOSITORY: Meal Entries
 * Goal: Execute raw SQL queries against the meal_entries table.
 * This layer only knows about PostgreSQL and DbInterface types.
 * 
 * NOTE: Uses actual database column names: meal_type, protein_g, carbs_g, fat_g, sugar_g
 * Industry Standard: NO Business Logic here (no calculations, no transformations).
 */
export class MealRepository {
    /**
     * Fetch all meal entries from the database.
     * @returns Array of DbMealEntry (raw database rows)
     */
    async findAll(): Promise<DbMealEntry[]> {
        const query = 'SELECT * FROM meal_entries';
        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Fetch meal entries for a specific user.
     * @param userId - The user's ID
     * @returns Array of DbMealEntry
     */
    async findByUserId(userId: string): Promise<DbMealEntry[]> {
        const query = 'SELECT * FROM meal_entries WHERE user_id = $1 ORDER BY meal_date DESC, meal_time DESC';
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Fetch a single meal entry by ID.
     * @param id - The meal entry ID
     * @returns DbMealEntry or null if not found
     */
    async findById(id: string): Promise<DbMealEntry | null> {
        const query = 'SELECT * FROM meal_entries WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Fetch meal entries for a specific user and date.
     * @param userId - The user's ID
     * @param mealDate - The date in YYYY-MM-DD format
     * @returns Array of DbMealEntry
     */
    async findByUserIdAndDate(userId: string, mealDate: string): Promise<DbMealEntry[]> {
        const query = 'SELECT * FROM meal_entries WHERE user_id = $1 AND meal_date = $2 ORDER BY meal_time ASC';
        const result = await pool.query(query, [userId, mealDate]);
        return result.rows;
    }

    /**
     * Insert a new meal entry.
     * @param entry - Partial DbMealEntry (excluding id and created_at)
     * @returns The newly created DbMealEntry
     */
    async create(entry: Omit<DbMealEntry, 'id' | 'created_at'>): Promise<DbMealEntry> {
        const query = `
            INSERT INTO meal_entries (
                user_id, name, meal_type, meal_time, meal_date,
                calories, protein_g, carbs_g, fat_g, sugar_g,
                image_url, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            entry.user_id,
            entry.name,
            entry.meal_type,
            entry.meal_time,
            entry.meal_date,
            entry.calories,
            entry.protein_g,
            entry.carbs_g,
            entry.fat_g,
            entry.sugar_g,
            entry.image_url,
            entry.notes,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Update an existing meal entry.
     * @param id - The meal entry ID
     * @param updates - Partial DbMealEntry with fields to update
     * @returns The updated DbMealEntry or null if not found
     */
    async update(id: string, updates: Partial<Omit<DbMealEntry, 'id' | 'created_at'>>): Promise<DbMealEntry | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        // Build dynamic SET clause
        Object.entries(updates).forEach(([key, value]) => {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id); // Add ID as the last parameter
        const query = `UPDATE meal_entries SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * Delete a meal entry by ID.
     * @param id - The meal entry ID
     * @returns True if deleted, false if not found
     */
    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM meal_entries WHERE id = $1';
        const result = await pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
