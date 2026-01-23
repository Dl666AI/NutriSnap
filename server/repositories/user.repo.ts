import pool from '../config/db';
import { DbUser } from '../src/shared/users_schema';

/**
 * REPOSITORY: Users
 * Goal: Execute raw SQL queries against the users table.
 * This layer only knows about PostgreSQL and DbInterface types.
 * 
 * Industry Standard: NO Business Logic here (no calculations, no transformations).
 */
export class UserRepository {
    /**
     * Fetch all users from the database.
     * @returns Array of DbUser (raw database rows)
     */
    async findAll(): Promise<DbUser[]> {
        const query = 'SELECT * FROM users';
        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Fetch a single user by ID.
     * @param id - The user's ID
     * @returns DbUser or null if not found
     */
    async findById(id: string): Promise<DbUser | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Fetch a user by email address.
     * @param email - The user's email
     * @returns DbUser or null if not found
     */
    async findByEmail(email: string): Promise<DbUser | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    /**
     * Insert a new user.
     * @param user - Partial DbUser (excluding id, created_at, updated_at)
     * @returns The newly created DbUser
     */
    async create(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
        const query = `
            INSERT INTO users (
                email, name, gender, date_of_birth, height, weight, goal, photo_url,
                daily_calories, daily_protein, daily_carbs, daily_sugar
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            user.email,
            user.name,
            user.gender,
            user.date_of_birth,
            user.height,
            user.weight,
            user.goal,
            user.photo_url,
            user.daily_calories,
            user.daily_protein,
            user.daily_carbs,
            user.daily_sugar,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Update an existing user.
     * @param id - The user's ID
     * @param updates - Partial DbUser with fields to update
     * @returns The updated DbUser or null if not found
     */
    async update(id: string, updates: Partial<Omit<DbUser, 'id' | 'created_at' | 'updated_at'>>): Promise<DbUser | null> {
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

        // Always update the updated_at timestamp
        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(id); // Add ID as the last parameter
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * Delete a user by ID.
     * @param id - The user's ID
     * @returns True if deleted, false if not found
     */
    async delete(id: string): Promise<boolean> {
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    /**
     * Upsert a user (insert if not exists, update if exists).
     * Useful for OAuth login flows AND profile updates.
     * @param user - User data
     * @returns The upserted DbUser
     */
    async upsert(user: Omit<DbUser, 'created_at' | 'updated_at'>): Promise<DbUser> {
        const query = `
            INSERT INTO users (
                id, email, name, gender, date_of_birth, height, weight, goal, photo_url,
                daily_calories, daily_protein, daily_carbs, daily_sugar
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                gender = COALESCE(EXCLUDED.gender, users.gender),
                date_of_birth = COALESCE(EXCLUDED.date_of_birth, users.date_of_birth),
                height = COALESCE(EXCLUDED.height, users.height),
                weight = COALESCE(EXCLUDED.weight, users.weight),
                goal = COALESCE(EXCLUDED.goal, users.goal),
                photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
                daily_calories = COALESCE(EXCLUDED.daily_calories, users.daily_calories),
                daily_protein = COALESCE(EXCLUDED.daily_protein, users.daily_protein),
                daily_carbs = COALESCE(EXCLUDED.daily_carbs, users.daily_carbs),
                daily_sugar = COALESCE(EXCLUDED.daily_sugar, users.daily_sugar),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const values = [
            user.id,
            user.email,
            user.name,
            user.gender,
            user.date_of_birth,
            user.height,
            user.weight,
            user.goal,
            user.photo_url,
            user.daily_calories,
            user.daily_protein,
            user.daily_carbs,
            user.daily_sugar,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
