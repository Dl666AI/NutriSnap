import { z } from 'zod';

/**
 * SHARED SCHEMA: WEIGHT HISTORY
 * Matches the 'weight_history' table.
 */

export interface DbWeightHistory {
    id: string;
    user_id: string;
    weight: number | string; // Numeric can be string in PG
    date: Date | string;
}

export const WeightHistorySchema = z.object({
    id: z.string().optional(),
    userId: z.string(),
    weight: z.number(),
    date: z.string().or(z.date()).optional(),
});

export type WeightHistoryEntry = z.infer<typeof WeightHistorySchema>;

export const mapDbToWeightHistory = (row: DbWeightHistory): WeightHistoryEntry => {
    return {
        id: row.id,
        userId: row.user_id,
        weight: Number(row.weight),
        date: row.date,
    };
};
