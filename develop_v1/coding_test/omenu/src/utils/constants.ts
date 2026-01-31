import type { CookSchedule, Difficulty, IngredientCategory, DayOfWeek, MealType } from '@/types';

// ===== Days and Meals =====
export const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

// ===== Ingredient Categories =====
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'proteins',
  'vegetables',
  'fruits',
  'grains',
  'dairy',
  'seasonings',
  'pantry_staples',
  'others',
];

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  proteins: 'Proteins',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  dairy: 'Dairy',
  seasonings: 'Seasonings',
  pantry_staples: 'Pantry Staples',
  others: 'Others',
};

// ===== Difficulty =====
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// ===== Keywords for Step 2 =====
export const KEYWORDS_BY_CATEGORY = {
  cookingStyle: [
    'Quick',
    'Easy',
    'One-Pot',
    'Sheet Pan',
    'Slow Cooker',
    'Instant Pot',
    'Grilling',
    'Meal Prep',
    'Under 30 Min',
    'Weeknight',
  ],
  dietHealth: [
    'Healthy',
    'Vegetarian',
    'Vegan',
    'Dairy-Free',
    'Gluten-Free',
    'Low-Carb',
    'Keto',
    'High-Protein',
    'Low-Sodium',
    'Heart-Healthy',
  ],
  cuisine: [
    'American',
    'Italian',
    'Mexican',
    'Chinese',
    'Japanese',
    'Thai',
    'Indian',
    'Korean',
    'Vietnamese',
    'Mediterranean',
    'Greek',
    'Southern',
    'Cajun',
    'Tex-Mex',
  ],
  other: [
    'Kid-Friendly',
    'Family-Style',
    'Comfort Food',
    'Budget-Friendly',
    'BBQ',
    'Soul Food',
  ],
};

// ===== Must-Have Items for Step 3 =====
export const MUST_HAVE_BY_CATEGORY = {
  proteins: [
    { emoji: '🥚', name: 'Eggs' },
    { emoji: '🥓', name: 'Bacon' },
    { emoji: '🍗', name: 'Chicken' },
    { emoji: '🦃', name: 'Turkey' },
    { emoji: '🥩', name: 'Beef' },
    { emoji: '🐷', name: 'Pork' },
    { emoji: '🍖', name: 'Steak' },
    { emoji: '🐟', name: 'Salmon' },
    { emoji: '🐟', name: 'Tuna' },
    { emoji: '🦐', name: 'Shrimp' },
    { emoji: '🍳', name: 'Tofu' },
  ],
  grainsCarbs: [
    { emoji: '🍞', name: 'Bread' },
    { emoji: '🍚', name: 'Rice' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🥔', name: 'Potatoes' },
    { emoji: '🥣', name: 'Oatmeal' },
    { emoji: '🥞', name: 'Pancakes' },
  ],
  dairy: [
    { emoji: '🥛', name: 'Milk' },
    { emoji: '🧀', name: 'Cheese' },
    { emoji: '🥛', name: 'Yogurt' },
    { emoji: '🧈', name: 'Butter' },
  ],
  vegetables: [
    { emoji: '🥦', name: 'Broccoli' },
    { emoji: '🥕', name: 'Carrots' },
    { emoji: '🥗', name: 'Salad' },
    { emoji: '🌽', name: 'Corn' },
    { emoji: '🥑', name: 'Avocado' },
  ],
  mealTypes: [
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🌮', name: 'Tacos' },
    { emoji: '🍔', name: 'Burgers' },
    { emoji: '🥪', name: 'Sandwiches' },
    { emoji: '🌯', name: 'Wraps' },
    { emoji: '🍜', name: 'Soup' },
    { emoji: '🍱', name: 'Bowls' },
    { emoji: '🥙', name: 'Pita' },
  ],
  pantry: [
    { emoji: '🫘', name: 'Beans' },
    { emoji: '🥜', name: 'Peanut Butter' },
    { emoji: '🥜', name: 'Nuts' },
  ],
};

// ===== Disliked Items for Step 4 =====
export const DISLIKED_BY_CATEGORY = {
  allergens: [
    { emoji: '🥜', name: 'Peanuts' },
    { emoji: '🌰', name: 'Tree Nuts' },
    { emoji: '🥛', name: 'Dairy/Lactose' },
    { emoji: '🌾', name: 'Gluten' },
    { emoji: '🥚', name: 'Eggs' },
    { emoji: '🦐', name: 'Shellfish' },
    { emoji: '🐟', name: 'Fish' },
    { emoji: '🌱', name: 'Soy' },
  ],
  seafood: [
    { emoji: '🦑', name: 'Squid' },
    { emoji: '🐙', name: 'Octopus' },
    { emoji: '🦞', name: 'Lobster' },
    { emoji: '🦀', name: 'Crab' },
  ],
  vegetables: [
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🌿', name: 'Cilantro' },
    { emoji: '🥒', name: 'Cucumber' },
    { emoji: '🍄', name: 'Mushrooms' },
    { emoji: '🫑', name: 'Bell Peppers' },
    { emoji: '🍆', name: 'Eggplant' },
    { emoji: '🥬', name: 'Brussels Sprouts' },
    { emoji: '🥦', name: 'Broccoli' },
    { emoji: '🫒', name: 'Olives' },
    { emoji: '🌿', name: 'Celery' },
    { emoji: '🥬', name: 'Kale' },
    { emoji: '🌶️', name: 'Jalapeño' },
    { emoji: '🥒', name: 'Pickled Cucumber' },
  ],
  meats: [
    { emoji: '🐷', name: 'Pork' },
    { emoji: '🥩', name: 'Red Meat' },
    { emoji: '🍖', name: 'Organ Meat' },
    { emoji: '🦴', name: 'Bone-in Meat' },
  ],
  flavorsTextures: [
    { emoji: '🌶️', name: 'Spicy Food' },
    { emoji: '🫚', name: 'Ginger' },
    { emoji: '🥥', name: 'Coconut' },
    { emoji: '🥗', name: 'Raw Vegetables' },
  ],
  cookingStyles: [
    { emoji: '🛢️', name: 'Fried Food' },
    { emoji: '🧈', name: 'Butter' },
    { emoji: '🥛', name: 'Heavy Cream' },
    { emoji: '🍺', name: 'Alcohol in Cooking' },
  ],
  other: [
    { emoji: '🧃', name: 'Artificial Sweeteners' },
    { emoji: '🧂', name: 'High Sodium' },
  ],
};

// ===== Default Values =====
export const DEFAULT_NUM_PEOPLE = 2;
export const DEFAULT_BUDGET = 100;
export const DEFAULT_DIFFICULTY: Difficulty = 'medium';

export const BUDGET_MIN = 50;
export const BUDGET_MAX = 500;
export const BUDGET_STEP = 10;

export const PEOPLE_MIN = 1;
export const PEOPLE_MAX = 10;

// ===== Default Cook Schedule (All false) =====
export const DEFAULT_COOK_SCHEDULE: CookSchedule = {
  monday: { breakfast: false, lunch: false, dinner: false },
  tuesday: { breakfast: false, lunch: false, dinner: false },
  wednesday: { breakfast: false, lunch: false, dinner: false },
  thursday: { breakfast: false, lunch: false, dinner: false },
  friday: { breakfast: false, lunch: false, dinner: false },
  saturday: { breakfast: false, lunch: false, dinner: false },
  sunday: { breakfast: false, lunch: false, dinner: false },
};

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'omenu_user_preferences',
  MEAL_PLAN_DRAFT: 'omenu_meal_plan_draft',
  CURRENT_PLAN_ID: 'omenu_current_plan_id',
};

// ===== IndexedDB =====
export const DB_NAME = 'OMenuDB';
export const DB_VERSION = 1;

export const STORES = {
  MEAL_PLANS: 'mealPlans',
  SHOPPING_LISTS: 'shoppingLists',
} as const;

// ===== API =====
export const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export const API_TIMEOUT_MS = 360000;
export const MAX_RETRIES = 3;
