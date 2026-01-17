# NutriSnap - AI-Powered Nutrition Tracking

NutriSnap is a world-class, mobile-first web application designed to simplify nutrition tracking through artificial intelligence. By leveraging computer vision and a seamless user interface, NutriSnap helps users maintain their health goals with minimal friction.

## Project Description

NutriSnap aims to bridge the gap between "wanting to eat healthy" and "actually tracking intake." Traditional apps are tedious; NutriSnap makes logging a meal as simple as snapping a photo. It provides real-time feedback on calories and macronutrients (Protein, Carbs, Fat, Sugar) to help users stay within their daily targets.

### Key Features

*   **AI Vision Logging**: Real-time camera integration to capture and identify meals instantly.
*   **Manual Entry**: Flexibility to log meals without photos, allowing manual input of calories and macros.
*   **Smart Diary**: A chronological record of the day's intake grouped by meal type (Breakfast, Lunch, Dinner, Snack).
*   **Progress Insights**: Visual representation of weekly calorie trends and macronutrient distribution.
*   **Persistent Profile**: User profiles with simulated authentication (Google/Apple) and persistent local storage.
*   **Adaptive Theming**: Full support for Light and Dark modes with system synchronization.

---

## Data Persistence & Limitations

**⚠️ Important Note for Users & Developers**

NutriSnap currently operates as a client-side application using the browser's **Local Storage** to persist data. This has several important implications:

1.  **Device Specificity**: Data is stored *only* on the device and browser where it was created. If you log a meal on your phone, you will not see it on your laptop, even if you log in with the same email.
2.  **Browser Cache**: Clearing your browser's cache, cookies, or local data will **permanently delete** your logs and profile settings.
3.  **Privacy**: Your nutrition data never leaves your device (except for the transient API call to the AI model for image analysis).

**For Developers - Architecture Note:**
The application uses a `StorageAdapter` pattern in `DataContext.tsx`. The current implementation writes to `localStorage` using keys namespaced by User ID (e.g., `nutrisnap_meals_12345`). To upgrade this to a cloud-based solution (like Firebase or PostgreSQL), you simply need to update the `StorageAdapter.load` and `StorageAdapter.save` methods to perform API calls. The rest of the UI is agnostic to the storage medium.

---

## Overall Architecture

NutriSnap follows a modular, component-based architecture built with **React** and **Tailwind CSS**.

### 1. Navigation & Routing
The app uses a **State-Based Router** in `App.tsx` rather than traditional URL routing. This provides a smoother, "app-like" experience by managing a `currentScreen` state. 
*   **Tab System**: Remembers the last active main tab (Home, Diary, Insights, Profile) to return the user there after a flow (like Camera or Manual Entry) is completed or cancelled.

### 2. State Management
*   **DataContext**: Centralized store for the `meals` array. It handles adding/removing entries and computes real-time `totals` (calories, macros) and progress against `targets`.
*   **ThemeContext**: Manages the application's appearance state (Light/Dark/System) and persists the choice to `localStorage`.
*   **Local Persistence**: Both user authentication and nutrition data are mirrored to `localStorage` to ensure data survives page refreshes.

### 3. Component Hierarchy
*   **Screens**: High-level components representing full views (e.g., `HomeScreen`, `CameraScreen`).
*   **UI Components**: Reusable interface elements like `BottomNav`, `MacroCards`, and `AuthSimulation`.
*   **Contexts**: Providers that wrap the application to inject global logic.

### 4. Technical Stack
*   **Frontend**: React 19 (ES6+ Modules).
*   **Styling**: Tailwind CSS via CDN with a customized `tailwind.config`.
*   **Icons**: Material Symbols Outlined for a clean, modern iconography.
*   **Hardware Integration**: Browser `MediaDevices` API for real-time camera access and frame capture.

### 5. Design Language
The design follows a **Sophisticated Nature** aesthetic:
*   **Primary Color**: `#9cab8c` (Sage Green) - evokes health and freshness.
*   **Accent Color**: `#F8DDA4` (Creamy Sand) - provides a warm, organic contrast.
*   **Micro-interactions**: Subtle CSS animations (`float-up`, `breath`, `scan`) and backdrop blurs create a high-end, premium feel.

---

## AI Implementation Roadmap
While currently using high-fidelity mock data for result simulation, the architecture is designed to integrate with the **Google Gemini API**:
1.  **Image-to-Text**: Sending captured base64 frames to `gemini-3-flash-preview`.
2.  **Structured JSON**: Prompting the model to return nutrition data in a structured schema.
3.  **Grounding**: Using search grounding for specialized or branded food items.

---

## Development & Deployment
The project is structured to run directly in a browser environment using ESM imports.
*   **Root**: `index.html`
*   **Entry**: `index.tsx`
*   **Configurations**: `metadata.json` (Permissions) and `tailwind.config` (Theming).