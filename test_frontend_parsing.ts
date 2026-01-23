
import fetch from 'node-fetch';

// Mock types
interface User {
    id: string;
    weight?: number;
    height?: number;
    // ... other fields
}

// COPIED FROM UserService.ts
const parseUserResponse = (data: any): User => {
    const getVal = (key: string, altKey: string) => {
        return data[key] !== undefined ? data[key] : data[altKey];
    };

    const parseNum = (val: any): number | undefined => {
        if (val === null || val === undefined || val === '') return undefined;
        if (typeof val === 'string' && val.trim() === '') return undefined;
        const num = Number(val);
        return isNaN(num) || num <= 0 ? undefined : num;
    };

    const parseStr = (val: any): string | undefined => {
        if (val === null || val === undefined) return undefined;
        if (typeof val === 'string' && val.trim() === '') return undefined;
        return val;
    };

    const parsed = {
        id: data.id,
        name: data.name || 'User',
        email: data.email || '',
        photoUrl: parseStr(getVal('photoUrl', 'photo_url')),
        dateOfBirth: parseStr(getVal('dateOfBirth', 'date_of_birth')),
        gender: parseStr(getVal('gender', 'gender')),
        goal: parseStr(getVal('goal', 'goal')),
        weight: parseNum(getVal('weight', 'weight')),
        height: parseNum(getVal('height', 'height')),
        dailyCalories: parseNum(getVal('dailyCalories', 'daily_calories')),
        dailyProtein: parseNum(getVal('dailyProtein', 'daily_protein')),
        dailyCarbs: parseNum(getVal('dailyCarbs', 'daily_carbs')),
        dailySugar: parseNum(getVal('dailySugar', 'daily_sugar')),
    };

    return parsed as User;
};

async function testFrontendParsing() {
    const userId = "114677646801454030326";
    const url = `http://localhost:3000/api/users/${userId}`;

    console.log(`Fetching from ${url}...`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("--- RAW BACKEND DATA ---");
        console.log(JSON.stringify(data, null, 2));

        console.log("--- PARSING... ---");
        const parsed = parseUserResponse(data);

        console.log("--- PARSED RESULT ---");
        console.log(JSON.stringify(parsed, null, 2));

        if (parsed.weight === 77) {
            console.log("✅ PARSING SUCCESS: Weight is present.");
        } else {
            console.log("❌ PARSING FAILURE: Weight is missing.");
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testFrontendParsing();
