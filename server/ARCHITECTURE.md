# NutriSnap Server - Refactored Architecture

## 🏗️ Bottom-Up Architecture

This server follows industry-standard **layered architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────┐
│  Controller/Routes Layer (HTTP I/O)    │  ← server/routes/
├─────────────────────────────────────────┤
│  Service Layer (Business Logic)        │  ← server/services/
├─────────────────────────────────────────┤
│  Repository Layer (Raw SQL)             │  ← server/repositories/
├─────────────────────────────────────────┤
│  Schema Layer (Type Safety + Zod)      │  ← server/src/shared/
├─────────────────────────────────────────┤
│  Database (PostgreSQL on GCP)          │
└─────────────────────────────────────────┘
```

## 📁 Directory Structure

```
server/
├── config/              # Database configuration
│   └── db.ts           # PostgreSQL connection pool
├── src/shared/         # Type definitions & Zod schemas
│   ├── meal_entries_schema.ts  # DbMealEntry + MealEntry + mapper
│   └── users_schema.ts         # DbUser + User + mapper
├── repositories/       # Raw SQL queries
│   ├── meal.repo.ts    # MealRepository (returns DbMealEntry)
│   └── user.repo.ts    # UserRepository (returns DbUser)
├── services/           # Business logic
│   ├── meal.service.ts # MealService (returns MealEntry)
│   └── user.service.ts # UserService (returns User)
├── routes/             # HTTP endpoints
│   ├── meal.routes.ts  # Express routes for /api/meals
│   └── user.routes.ts  # Express routes for /api/users
├── server.ts           # Main TypeScript entry point (NEW)
├── index.js            # Legacy JavaScript entry point (OLD)
├── package.json        # Dependencies & scripts
└── tsconfig.json       # TypeScript configuration
```

## 🎯 Layer Responsibilities

### 1. **Schema Layer** (`src/shared/`)
- Defines database interface types (`DbMealEntry`, `DbUser`)
- Defines application types (`MealEntry`, `User`) with Zod
- Provides mappers: `mapDbToMealEntry()`, `mapDbToUser()`
- **NO**: Business logic, database queries, HTTP handling

### 2. **Repository Layer** (`repositories/`)
- Executes raw SQL queries
- Returns database types (snake_case)
- **NO**: Business logic, data transformation, validation

### 3. **Service Layer** (`services/`)
- Calls repositories
- Uses Zod mappers to transform DB → App types
- Contains business logic (filtering, calculations, sanitization)
- **NO**: SQL queries, HTTP handling

### 4. **Controller/Routes Layer** (`routes/`)
- Handles HTTP request/response
- Validates input
- Calls service layer
- Returns JSON responses
- **NO**: Business logic, database queries

## 🚀 Running the Server

### Development (TypeScript with auto-reload)
```bash
npm run dev:ts
```

### Development (Legacy JavaScript)
```bash
npm run dev
```

### Build TypeScript
```bash
npm run build
```

### Production (TypeScript)
```bash
npm run build
npm run start:ts
```

### Production (Legacy JavaScript)
```bash
npm start
```

## 📊 API Endpoints

### Users (`/api/users`)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create or update user (upsert)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users` - Get all users

### Meals (`/api/meals`)
- `GET /api/meals?userId=xxx` - Get all meals for a user
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create new meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/stats/daily?userId=xxx&date=YYYY-MM-DD` - Get daily nutrition totals

## 🔄 Data Flow Example

### GET /api/meals?userId=123

```typescript
1. Client → GET /api/meals?userId=123

2. Routes Layer (meal.routes.ts)
   ↓ Validates userId parameter
   ↓ Calls: mealService.getMealsByUserId('123')

3. Service Layer (meal.service.ts)
   ↓ Calls: mealRepo.findByUserId('123')

4. Repository Layer (meal.repo.ts)
   ↓ Executes: SELECT * FROM meal_entries WHERE user_id = $1
   ↓ Returns: DbMealEntry[] (snake_case)

5. Service Layer
   ↓ Maps: dbMeals.map(mapDbToMealEntry)
   ↓ Returns: MealEntry[] (camelCase, validated)

6. Routes Layer
   ↓ Transforms to legacy format (for backward compatibility)
   ↓ Returns: res.json(formattedMeals)

7. Client ← 200 OK with JSON data
```

## ✅ Type Safety Flow

```
PostgreSQL (snake_case)
    ↓ Repository returns
DbMealEntry { user_id, meal_type, protein_g, ... }
    ↓ Service maps via Zod
MealEntry { userId, mealType, protein, ... }
    ↓ Controller returns
JSON Response (client-friendly camelCase)
```

## 🛡️ Benefits of This Architecture

1. **Type Safety** - Zod validates all data at runtime
2. **Separation of Concerns** - Each layer has one job
3. **Testability** - Easy to mock each layer
4. **Maintainability** - Changes are isolated
5. **Scalability** - Easy to add new features
6. **No "LLM Loophole"** - Strict schemas prevent bugs

## 🔍 Key Files

- **server.ts** - New TypeScript entry point
- **meal.routes.ts** - Meal endpoint handlers
- **user.routes.ts** - User endpoint handlers
- **meal.service.ts** - Meal business logic
- **user.service.ts** - User business logic  
- **meal.repo.ts** - Meal SQL queries
- **user.repo.ts** - User SQL queries
- **meal_entries_schema.ts** - Meal type definitions
- **users_schema.ts** - User type definitions

## 📝 Migration Notes

The old `index.js` is kept for backward compatibility. To fully migrate:

1. Test the new TypeScript server: `npm run dev:ts`
2. Verify all endpoints work correctly
3. Update deployment to use `npm run build && npm run start:ts`
4. Remove `index.js` once fully migrated

## 🎓 Industry Standards Followed

✅ **Layered Architecture** - Clear separation of concerns  
✅ **Repository Pattern** - Abstract data access  
✅ **Service Pattern** - Encapsulate business logic  
✅ **DTO/Mapper Pattern** - Transform data between layers  
✅ **Dependency Injection** - Services instantiate repositories  
✅ **Type Safety** - TypeScript + Zod validation  
✅ **RESTful API** - Standard HTTP methods and status codes
