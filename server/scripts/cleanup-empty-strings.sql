-- ═══════════════════════════════════════════════════════════════════════════════
-- Database Cleanup Script: Convert Empty Strings to NULL
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Problem: Some user records have empty strings ('') in numeric/date fields
--          instead of NULL. This causes COALESCE to perpetuate the empty strings.
--
-- Solution: Update all empty strings to NULL so new data can be properly merged.
--
-- Run this script manually against your PostgreSQL database:
--   psql -h <host> -U <user> -d <database> -f cleanup-empty-strings.sql
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- Show current state before cleanup
SELECT 'BEFORE CLEANUP:' as status;
SELECT id, 
       CASE WHEN weight::text = '' THEN 'EMPTY' ELSE weight::text END as weight,
       CASE WHEN height::text = '' THEN 'EMPTY' ELSE height::text END as height,
       CASE WHEN date_of_birth::text = '' THEN 'EMPTY' ELSE date_of_birth::text END as dob,
       CASE WHEN gender = '' THEN 'EMPTY' ELSE gender END as gender,
       CASE WHEN goal = '' THEN 'EMPTY' ELSE goal END as goal,
       CASE WHEN daily_calories::text = '' THEN 'EMPTY' ELSE daily_calories::text END as cal
FROM users
WHERE weight::text = '' 
   OR height::text = '' 
   OR date_of_birth::text = ''
   OR gender = ''
   OR goal = ''
   OR daily_calories::text = ''
   OR daily_protein::text = ''
   OR daily_carbs::text = ''
   OR daily_sugar::text = '';

-- Perform the cleanup
UPDATE users SET 
    weight = NULLIF(weight::text, '')::numeric,
    height = NULLIF(height::text, '')::integer,
    date_of_birth = NULLIF(date_of_birth::text, '')::date,
    gender = NULLIF(gender, ''),
    goal = NULLIF(goal, ''),
    daily_calories = NULLIF(daily_calories::text, '')::integer,
    daily_protein = NULLIF(daily_protein::text, '')::integer,
    daily_carbs = NULLIF(daily_carbs::text, '')::integer,
    daily_sugar = NULLIF(daily_sugar::text, '')::integer,
    photo_url = NULLIF(photo_url, ''),
    updated_at = NOW()
WHERE weight::text = '' 
   OR height::text = '' 
   OR date_of_birth::text = ''
   OR gender = ''
   OR goal = ''
   OR daily_calories::text = ''
   OR daily_protein::text = ''
   OR daily_carbs::text = ''
   OR daily_sugar::text = ''
   OR photo_url = '';

-- Show results after cleanup
SELECT 'AFTER CLEANUP:' as status;
SELECT id, weight, height, date_of_birth, gender, goal, daily_calories 
FROM users;

SELECT 'Cleanup complete!' as status;
