import { UserRepository } from '../repositories/user.repo';
import { User, mapDbToUser, DbUser } from '../src/shared/users_schema';
import { WeightHistoryEntry, mapDbToWeightHistory } from '../src/shared/weight_history_schema';

/**
 * SERVICE: User Profiles
 * Goal: Business logic layer that transforms raw DB data into clean app data.
 * This layer uses repositories to fetch data, then applies Zod mappers.
 * 
 * Industry Standard: This is where business logic lives (data sanitization, validation).
 */
export class UserService {
    private userRepo: UserRepository;

    constructor() {
        this.userRepo = new UserRepository();
    }

    /**
     * Get all users (clean application types).
     * @returns Array of User (camelCase, validated)
     */
    async getAllUsers(): Promise<User[]> {
        const dbUsers = await this.userRepo.findAll();
        return dbUsers.map(mapDbToUser);
    }

    /**
     * Get a user by ID.
     * @param id - The user's ID
     * @returns User or null if not found
     */
    async getUserById(id: string): Promise<User | null> {
        const dbUser = await this.userRepo.findById(id);
        return dbUser ? mapDbToUser(dbUser) : null;
    }

    /**
     * Get a user by email.
     * @param email - The user's email
     * @returns User or null if not found
     */
    async getUserByEmail(email: string): Promise<User | null> {
        const dbUser = await this.userRepo.findByEmail(email);
        return dbUser ? mapDbToUser(dbUser) : null;
    }

    /**
     * Create or update a user (upsert).
     * BUSINESS LOGIC: Sanitizes input data before saving.
     * @param userData - User data in application format (camelCase)
     * @returns The upserted User
     */
    async upsertUser(userData: {
        id: string;
        email: string;
        name: string;
        gender?: string | null;
        dateOfBirth?: string | null;
        height?: number | null;
        weight?: number | null;
        goal?: string | null;
        photoUrl?: string | null;
        dailyCalories?: number | null;
        dailyProtein?: number | null;
        dailyCarbs?: number | null;
        dailySugar?: number | null;
    }): Promise<User> {
        // Sanitize data before saving
        const sanitizedData: Omit<DbUser, 'created_at' | 'updated_at'> = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            gender: this.sanitizeString(userData.gender),
            date_of_birth: this.sanitizeString(userData.dateOfBirth),
            height: this.sanitizeInteger(userData.height),
            weight: this.sanitizeNumeric(userData.weight),
            goal: this.sanitizeString(userData.goal),
            photo_url: this.sanitizeString(userData.photoUrl),
            daily_calories: this.sanitizeInteger(userData.dailyCalories),
            daily_protein: this.sanitizeInteger(userData.dailyProtein),
            daily_carbs: this.sanitizeInteger(userData.dailyCarbs),
            daily_sugar: this.sanitizeInteger(userData.dailySugar),
        };

        const dbUser = await this.userRepo.upsert(sanitizedData);
        return mapDbToUser(dbUser);
    }

    /**
     * Update an existing user.
     * BUSINESS LOGIC: Sanitizes input and preserves existing values for null fields.
     * @param id - The user's ID
     * @param updates - Partial user data to update
     * @returns The updated User or null if not found
     */
    async updateUser(id: string, updates: Partial<{
        email: string;
        name: string;
        gender: string | null;
        dateOfBirth: string | null;
        height: number | null;
        weight: number | null;
        goal: string | null;
        photoUrl: string | null;
        dailyCalories: number | null;
        dailyProtein: number | null;
        dailyCarbs: number | null;
        dailySugar: number | null;
    }>): Promise<User | null> {
        // Convert camelCase to snake_case for database
        const dbUpdates: Partial<Omit<DbUser, 'id' | 'created_at' | 'updated_at'>> = {};

        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.gender !== undefined) dbUpdates.gender = this.sanitizeString(updates.gender);
        if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = this.sanitizeString(updates.dateOfBirth);
        if (updates.height !== undefined) dbUpdates.height = this.sanitizeInteger(updates.height);
        if (updates.weight !== undefined) dbUpdates.weight = this.sanitizeNumeric(updates.weight);
        if (updates.goal !== undefined) dbUpdates.goal = this.sanitizeString(updates.goal);
        if (updates.photoUrl !== undefined) dbUpdates.photo_url = this.sanitizeString(updates.photoUrl);
        if (updates.dailyCalories !== undefined) dbUpdates.daily_calories = this.sanitizeInteger(updates.dailyCalories);
        if (updates.dailyProtein !== undefined) dbUpdates.daily_protein = this.sanitizeInteger(updates.dailyProtein);
        if (updates.dailyCarbs !== undefined) dbUpdates.daily_carbs = this.sanitizeInteger(updates.dailyCarbs);
        if (updates.dailySugar !== undefined) dbUpdates.daily_sugar = this.sanitizeInteger(updates.dailySugar);

        const dbUser = await this.userRepo.update(id, dbUpdates);
        return dbUser ? mapDbToUser(dbUser) : null;
    }

    /**
     * Delete a user.
     * @param id - The user's ID
     * @returns True if deleted, false if not found
     */
    async deleteUser(id: string): Promise<boolean> {
        return await this.userRepo.delete(id);
    }

    /**
     * BUSINESS LOGIC: Check if a user exists or create a minimal user entry.
     * Useful for lazy user creation during meal entry.
     * @param userId - The user's ID
     * @param defaultName - Default name if creating a new user
     */
    async ensureUserExists(userId: string, defaultName: string = 'Unknown User'): Promise<void> {
        const existingUser = await this.userRepo.findById(userId);
        if (!existingUser) {
            await this.userRepo.create({
                email: `${userId}@placeholder.com`, // Placeholder email
                name: defaultName,
                gender: null,
                date_of_birth: null,
                height: null,
                weight: null,
                goal: null,
                photo_url: null,
                daily_calories: null,
                daily_protein: null,
                daily_carbs: null,
                daily_sugar: null,
            });
        }
    }

    // ==========================================
    // BUSINESS LOGIC: Data Sanitization Helpers
    // ==========================================

    /**
     * Sanitize integer values (for height, daily targets).
     * Converts empty strings, undefined, null, and invalid numbers to null.
     */
    private sanitizeInteger(val: number | string | null | undefined): number | null {
        if (val === '' || val === undefined || val === null) return null;
        const num = Number(val);
        if (isNaN(num) || num <= 0) return null;
        return Math.round(num); // Round to integer
    }

    /**
     * Sanitize numeric values (for weight - can have decimals).
     * Converts empty strings, undefined, null, and invalid numbers to null.
     */
    private sanitizeNumeric(val: number | string | null | undefined): number | null {
        if (val === '' || val === undefined || val === null) return null;
        const num = Number(val);
        if (isNaN(num) || num <= 0) return null;
        return num; // Keep decimals
    }

    /**
     * Sanitize string values (for gender, goal, photoUrl, dateOfBirth).
     * Converts empty strings, undefined, and null to null.
     */
    private sanitizeString(val: string | null | undefined): string | null {
        if (typeof val === 'string' && val.trim() === '') return null;
        if (val === undefined || val === null) return null;
        return val;
    }

    /**
     * Get weight history for a user.
     * @param userId - The user's ID
     * @returns Array of WeightHistoryEntry
     */
    async getWeightHistory(userId: string): Promise<WeightHistoryEntry[]> {
        const history = await this.userRepo.getWeightHistory(userId);
        return history.map(mapDbToWeightHistory);
    }
}
