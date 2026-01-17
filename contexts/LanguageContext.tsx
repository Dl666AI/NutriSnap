import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    app_name: "NutriSnap",
    splash_subtitle: "Eat Fresh. Track Smart.",
    loading: "Loading",
    version: "Version",
    nav_home: "Home",
    nav_diary: "Diary",
    nav_insights: "Insights",
    nav_profile: "Profile",
    today: "Today",
    welcome: "Welcome",
    hello: "Hello",
    guest: "Guest",
    kcal_left: "Kcal Left",
    target: "Target",
    consumed: "Consumed",
    remaining: "Remaining",
    todays_macros: "Today's Macros",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    sugar: "Sugar",
    left: "left",
    recent_meals: "Recent Meals",
    view_all: "View All",
    no_meals_today: "No meals logged yet today.",
    log_next_meal: "Tap to log your next meal",
    camera_error: "Unable to access camera. Please check permissions.",
    use_manual_entry: "Use Manual Entry",
    ai_vision_active: "AI Vision Active",
    center_meal: "Center your meal in the frame",
    take_photo_hint: "Take a photo to track instantly",
    result: "Result",
    retake: "Retake",
    analyzing: "Analyzing...",
    add_to_diary: "Add to Diary",
    settings: "Settings",
    sign_out: "Sign Out",
    appearance: "Appearance",
    language: "Language",
    logged_in_as: "Logged in as",
    my_stats: "My Stats",
    edit: "Edit",
    weight: "Weight",
    height: "Height",
    age: "Age",
    daily_targets: "Daily Targets",
    max_sugar: "Sugar (Max)",
    consistency: "Consistency",
    food_diary: "Food Diary",
    yesterday: "Yesterday",
    total_calories: "Total Calories",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    no_log_prefix: "No",
    no_log_suffix: "logged",
    calories_this_week: "Calories this week",
    weekly_average: "Weekly Average",
    macro_distribution: "Macro Distribution",
    weight_trend: "Weight Trend",
    current_weight: "Current Weight",
    log_meal: "Log Meal",
    choose_method: "Choose how you want to add your food",
    scan_meal: "Scan Meal",
    scan_hint: "Snap a photo to track automatically",
    upload_photo: "Upload Photo",
    upload_hint: "Select from your gallery",
    manual_entry: "Manual Entry",
    manual_hint: "Type details manually",
    save_entry: "Save Entry",
    update_entry: "Update Entry",
    meal_name: "Meal Name",
    meal_placeholder: "e.g. Greek Yogurt Bowl",
    save_changes: "Save Changes",
    recalculate: "Recalculate Nutrition Targets",
    male: "Male",
    female: "Female",
    goal_lose: "Lose Weight",
    goal_muscle: "Build Muscle",
    goal_gain: "Gain Weight",
    current_goal: "Current Goal",
    choose_account: "Choose an account",
    continue_to: "to continue to NutriSnap",
    use_another: "Use another account",
    cancel: "Cancel",
    signing_in: "Signing in...",
    welcome_back: "Welcome back!",
    setup_required: "Setup Required",
    continue_guest: "Continue as Guest",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    agree: "By continuing, you agree to NutriSnap's",
    and: "and",
    start_camera: "Start Camera"
  },
  zh: {
    app_name: "NutriSnap",
    splash_subtitle: "吃得新鲜，记在心间",
    loading: "加载中",
    version: "版本",
    nav_home: "首页",
    nav_diary: "日记",
    nav_insights: "分析",
    nav_profile: "我的",
    today: "今天",
    welcome: "欢迎",
    hello: "你好",
    guest: "游客",
    kcal_left: "剩余卡路里",
    target: "目标",
    consumed: "已摄入",
    remaining: "剩余",
    todays_macros: "今日营养素",
    protein: "蛋白质",
    carbs: "碳水",
    fat: "脂肪",
    sugar: "糖",
    left: "剩余",
    recent_meals: "最近用餐",
    view_all: "查看全部",
    no_meals_today: "今天还没有记录用餐。",
    log_next_meal: "点击记录你的下一顿餐",
    camera_error: "无法访问相机，请检查权限。",
    use_manual_entry: "使用手动输入",
    ai_vision_active: "AI 视觉已激活",
    center_meal: "将食物置于框内",
    take_photo_hint: "拍照即刻记录",
    result: "分析结果",
    retake: "重拍",
    analyzing: "分析中...",
    add_to_diary: "添加到日记",
    settings: "设置",
    sign_out: "退出登录",
    appearance: "外观",
    language: "语言",
    logged_in_as: "登录身份",
    my_stats: "我的数据",
    edit: "编辑",
    weight: "体重",
    height: "身高",
    age: "年龄",
    daily_targets: "每日目标",
    max_sugar: "糖 (上限)",
    consistency: "坚持记录",
    food_diary: "饮食日记",
    yesterday: "昨天",
    total_calories: "总卡路里",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "零食",
    no_log_prefix: "未记录",
    no_log_suffix: "",
    calories_this_week: "本周卡路里",
    weekly_average: "周平均",
    macro_distribution: "营养素分布",
    weight_trend: "体重趋势",
    current_weight: "当前体重",
    log_meal: "记录用餐",
    choose_method: "选择添加方式",
    scan_meal: "扫描食物",
    scan_hint: "拍照自动识别营养成分",
    upload_photo: "上传照片",
    upload_hint: "从相册选择",
    manual_entry: "手动输入",
    manual_hint: "手动填写详细信息",
    save_entry: "保存记录",
    update_entry: "更新记录",
    meal_name: "食物名称",
    meal_placeholder: "例如：希腊酸奶碗",
    save_changes: "保存更改",
    recalculate: "重新计算目标",
    male: "男",
    female: "女",
    goal_lose: "减重",
    goal_muscle: "增肌",
    goal_gain: "增重",
    current_goal: "当前目标",
    choose_account: "选择账号",
    continue_to: "以继续使用 NutriSnap",
    use_another: "使用其他账号",
    cancel: "取消",
    signing_in: "登录中...",
    welcome_back: "欢迎回来！",
    setup_required: "需要设置",
    continue_guest: "以游客身份继续",
    terms: "服务条款",
    privacy: "隐私政策",
    agree: "继续即表示您同意 NutriSnap 的",
    and: "和",
    start_camera: "启动相机"
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-language');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: keyof Translations) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};