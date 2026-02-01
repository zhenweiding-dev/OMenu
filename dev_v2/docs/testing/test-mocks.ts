/**
 * OMenu Test Mock Data
 * Mock data for unit tests, integration tests, and E2E tests
 * 
 * IMPORTANT: All data structures must match DATA_MODELS.md and API_SPEC.md
 */

import type {
  Recipe,
  Ingredient,
  IngredientCategory,
  Difficulty,
  MealPlan,
  DayMeals,
  ShoppingList,
  ShoppingItem,
  UserPreferences,
  CookSchedule,
  MealSelection,
  MenuBook,
} from './types';

// ============================================
// Base Type Constants
// ============================================

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'proteins', 'vegetables', 'fruits', 'grains', 'dairy', 'seasonings', 'pantry_staples', 'others'
];

// ============================================
// Recipe (Single Meal) Mock
// ============================================

export const mockBreakfast: Recipe = {
  id: 'mon-breakfast-001',
  name: 'Scrambled Eggs with Tomato',
  estimatedTime: 15,
  servings: 2,
  totalCalories: 320,
  difficulty: 'easy',
  ingredients: [
    { name: 'eggs', quantity: 4, unit: 'count', category: 'proteins' },
    { name: 'tomatoes', quantity: 2, unit: 'count', category: 'vegetables' },
    { name: 'vegetable oil', quantity: 0, unit: '', category: 'seasonings' },
    { name: 'salt', quantity: 0, unit: '', category: 'seasonings' },
    { name: 'green onions', quantity: 2, unit: 'count', category: 'vegetables' },
  ],
  instructions: '1. Beat eggs with a pinch of salt in a bowl\n2. Dice tomatoes into small pieces\n3. Heat oil in a pan over medium heat\n4. Pour in eggs and scramble until just set\n5. Add tomatoes, mix gently, and serve',
  notes: 'Add a pinch of sugar for better taste',
};

export const mockLunch: Recipe = {
  id: 'mon-lunch-001',
  name: 'Chicken Caesar Salad',
  estimatedTime: 20,
  servings: 2,
  totalCalories: 450,
  difficulty: 'easy',
  ingredients: [
    { name: 'chicken breast', quantity: 1, unit: 'lbs', category: 'proteins' },
    { name: 'romaine lettuce', quantity: 1, unit: 'count', category: 'vegetables' },
    { name: 'parmesan cheese', quantity: 0.5, unit: 'cup', category: 'dairy' },
    { name: 'caesar dressing', quantity: 0, unit: '', category: 'seasonings' },
    { name: 'croutons', quantity: 1, unit: 'cup', category: 'grains' },
  ],
  instructions: '1. Season and grill chicken breast until cooked\n2. Let chicken rest, then slice\n3. Chop romaine lettuce and place in bowl\n4. Add sliced chicken, parmesan, and croutons\n5. Drizzle with caesar dressing and toss',
  notes: '',
};

export const mockDinner: Recipe = {
  id: 'mon-dinner-001',
  name: 'Beef Stir-fry with Rice',
  estimatedTime: 30,
  servings: 2,
  totalCalories: 580,
  difficulty: 'medium',
  ingredients: [
    { name: 'beef sirloin', quantity: 1, unit: 'lbs', category: 'proteins' },
    { name: 'jasmine rice', quantity: 2, unit: 'cups', category: 'grains' },
    { name: 'bell peppers', quantity: 2, unit: 'count', category: 'vegetables' },
    { name: 'broccoli', quantity: 1, unit: 'cup', category: 'vegetables' },
    { name: 'soy sauce', quantity: 0, unit: '', category: 'seasonings' },
    { name: 'garlic', quantity: 3, unit: 'count', category: 'vegetables' },
    { name: 'ginger', quantity: 0, unit: '', category: 'seasonings' },
  ],
  instructions: '1. Cook rice according to package instructions\n2. Slice beef into thin strips\n3. Cut vegetables into bite-sized pieces\n4. Stir-fry beef in hot oil until browned\n5. Add vegetables and sauce, cook until tender\n6. Serve over rice',
  notes: 'Can substitute with chicken or tofu',
};

export const mockEmptyMeal = null;

// ============================================
// Day Meals Mock
// ============================================

export const mockMondayFull: DayMeals = {
  breakfast: mockBreakfast,
  lunch: mockLunch,
  dinner: mockDinner,
};

export const mockTuesdayPartial: DayMeals = {
  breakfast: null,
  lunch: {
    id: 'tue-lunch-001',
    name: 'Turkey Club Sandwich',
    estimatedTime: 10,
    servings: 2,
    totalCalories: 380,
    difficulty: 'easy',
    ingredients: [
      { name: 'turkey slices', quantity: 6, unit: 'oz', category: 'proteins' },
      { name: 'bread', quantity: 3, unit: 'count', category: 'grains' },
      { name: 'bacon', quantity: 4, unit: 'count', category: 'proteins' },
      { name: 'lettuce', quantity: 2, unit: 'count', category: 'vegetables' },
      { name: 'tomato', quantity: 1, unit: 'count', category: 'vegetables' },
      { name: 'mayo', quantity: 0, unit: '', category: 'seasonings' },
    ],
    instructions: '1. Toast bread slices\n2. Cook bacon until crispy\n3. Layer turkey, bacon, lettuce, and tomato\n4. Spread mayo and assemble sandwich',
    notes: '',
  },
  dinner: {
    id: 'tue-dinner-001',
    name: 'Salmon with Asparagus',
    estimatedTime: 25,
    servings: 2,
    totalCalories: 490,
    difficulty: 'medium',
    ingredients: [
      { name: 'salmon fillet', quantity: 1, unit: 'lbs', category: 'proteins' },
      { name: 'asparagus', quantity: 1, unit: 'bunch', category: 'vegetables' },
      { name: 'lemon', quantity: 1, unit: 'count', category: 'fruits' },
      { name: 'olive oil', quantity: 0, unit: '', category: 'seasonings' },
      { name: 'garlic', quantity: 2, unit: 'count', category: 'vegetables' },
    ],
    instructions: '1. Preheat oven to 400°F\n2. Season salmon with salt, pepper, and lemon\n3. Toss asparagus with olive oil and garlic\n4. Bake salmon and asparagus for 15-20 minutes\n5. Serve with lemon wedges',
    notes: '',
  },
};

export const mockEmptyDay: DayMeals = {
  breakfast: null,
  lunch: null,
  dinner: null,
};

// ============================================
// Helper function to create simple recipe
// ============================================

function createSimpleRecipe(
  id: string,
  name: string,
  estimatedTime: number,
  totalCalories: number,
  difficulty: Difficulty = 'easy'
): Recipe {
  return {
    id,
    name,
    estimatedTime,
    servings: 2,
    totalCalories,
    difficulty,
    ingredients: [],
    instructions: '',
    notes: '',
  };
}

// ============================================
// Default Cook Schedule
// ============================================

export const mockDefaultCookSchedule: CookSchedule = {
  monday: { breakfast: false, lunch: true, dinner: true },
  tuesday: { breakfast: false, lunch: true, dinner: true },
  wednesday: { breakfast: false, lunch: true, dinner: true },
  thursday: { breakfast: false, lunch: true, dinner: true },
  friday: { breakfast: false, lunch: true, dinner: true },
  saturday: { breakfast: true, lunch: true, dinner: true },
  sunday: { breakfast: true, lunch: true, dinner: false },
};

// ============================================
// User Preferences Mock
// ============================================

export const mockUserPreferences: UserPreferences = {
  keywords: ['Quick', 'Healthy', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken', 'Rice'],
  dislikedItems: ['Mushrooms', 'Cilantro'],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  cookSchedule: mockDefaultCookSchedule,
};

// ============================================
// Meal Plan (Complete Weekly Plan) Mock
// ============================================

export const mockMealPlan: MealPlan = {
  id: 'mp_abc123',
  createdAt: '2025-01-27T10:00:00Z',
  status: 'ready',
  preferences: mockUserPreferences,
  days: {
    monday: mockMondayFull,
    tuesday: mockTuesdayPartial,
    wednesday: {
      breakfast: null,
      lunch: createSimpleRecipe('wed-lunch-001', 'Vegetable Fried Rice', 20, 420),
      dinner: createSimpleRecipe('wed-dinner-001', 'Honey Garlic Chicken', 35, 520, 'medium'),
    },
    thursday: {
      breakfast: null,
      lunch: createSimpleRecipe('thu-lunch-001', 'Tuna Salad Wrap', 10, 350),
      dinner: createSimpleRecipe('thu-dinner-001', 'Pasta Primavera', 25, 480),
    },
    friday: {
      breakfast: null,
      lunch: createSimpleRecipe('fri-lunch-001', 'Greek Salad with Pita', 15, 380),
      dinner: createSimpleRecipe('fri-dinner-001', 'Fish Tacos', 30, 550, 'medium'),
    },
    saturday: {
      breakfast: createSimpleRecipe('sat-breakfast-001', 'Pancakes with Berries', 20, 450),
      lunch: createSimpleRecipe('sat-lunch-001', 'BLT Sandwich', 10, 400),
      dinner: createSimpleRecipe('sat-dinner-001', 'Grilled Steak with Potatoes', 40, 680, 'medium'),
    },
    sunday: {
      breakfast: createSimpleRecipe('sun-breakfast-001', 'Avocado Toast with Eggs', 15, 380),
      lunch: createSimpleRecipe('sun-lunch-001', 'Chicken Noodle Soup', 30, 350),
      dinner: null,
    },
  },
};

// ============================================
// Menu Book Mock
// ============================================

// Note: mockShoppingList is defined below, referenced here for MenuBook
export const mockCurrentMenuBook: MenuBook = {
  id: 'book-001',
  weekStartDate: '2025-01-27',
  weekEndDate: '2025-02-02',
  mealPlan: mockMealPlan,
  shoppingList: null,  // Will be set after mockShoppingList is defined
  foodEmojis: '🥚🥗🥩\n🍚🥦🍳',
  createdAt: '2025-01-27T10:00:00Z',
};

export const mockPastMenuBook1: MenuBook = {
  id: 'book-002',
  weekStartDate: '2025-01-20',
  weekEndDate: '2025-01-26',
  mealPlan: { ...mockMealPlan, id: 'mp_def456' },
  shoppingList: null,
  foodEmojis: '🍝🍗🥕\n🥐🧀🍲',
  createdAt: '2025-01-20T10:00:00Z',
};

export const mockPastMenuBook2: MenuBook = {
  id: 'book-003',
  weekStartDate: '2025-01-13',
  weekEndDate: '2025-01-19',
  mealPlan: { ...mockMealPlan, id: 'mp_ghi789' },
  shoppingList: null,
  foodEmojis: '🍜🥟🥬\n🍛🥒🍤',
  createdAt: '2025-01-13T10:00:00Z',
};

export const mockMenuBooks = [
  mockCurrentMenuBook,
  mockPastMenuBook1,
  mockPastMenuBook2,
];

// ============================================
// Shopping List Mock (Flat items array per API_SPEC.md)
// ============================================

export const mockShoppingList: ShoppingList = {
  id: 'sl_xyz789',
  mealPlanId: 'mp_abc123',
  createdAt: '2025-01-27T10:30:00Z',
  items: [
    // Proteins
    { id: 'item_001', name: 'Chicken Breast', category: 'proteins', totalQuantity: 2, unit: 'lbs', purchased: false },
    { id: 'item_002', name: 'Ground Beef', category: 'proteins', totalQuantity: 1, unit: 'lbs', purchased: false },
    { id: 'item_003', name: 'Salmon Fillet', category: 'proteins', totalQuantity: 1, unit: 'lbs', purchased: true },
    { id: 'item_004', name: 'Turkey Slices', category: 'proteins', totalQuantity: 6, unit: 'oz', purchased: false },
    { id: 'item_005', name: 'Eggs', category: 'proteins', totalQuantity: 12, unit: 'count', purchased: false },
    
    // Vegetables
    { id: 'item_006', name: 'Romaine Lettuce', category: 'vegetables', totalQuantity: 2, unit: 'count', purchased: false },
    { id: 'item_007', name: 'Tomatoes', category: 'vegetables', totalQuantity: 6, unit: 'count', purchased: false },
    { id: 'item_008', name: 'Asparagus', category: 'vegetables', totalQuantity: 1, unit: 'bunch', purchased: true },
    { id: 'item_009', name: 'Bell Peppers', category: 'vegetables', totalQuantity: 3, unit: 'count', purchased: false },
    { id: 'item_010', name: 'Broccoli', category: 'vegetables', totalQuantity: 2, unit: 'cups', purchased: false },
    
    // Dairy
    { id: 'item_011', name: 'Parmesan Cheese', category: 'dairy', totalQuantity: 0.5, unit: 'cup', purchased: false },
    
    // Grains
    { id: 'item_012', name: 'Jasmine Rice', category: 'grains', totalQuantity: 2, unit: 'cups', purchased: false },
    { id: 'item_013', name: 'Bread', category: 'grains', totalQuantity: 1, unit: 'loaf', purchased: false },
    
    // Seasonings (totalQuantity: 0, unit: '' - NOT displayed in UI)
    { id: 'item_014', name: 'Soy Sauce', category: 'seasonings', totalQuantity: 0, unit: '', purchased: false },
    { id: 'item_015', name: 'Olive Oil', category: 'seasonings', totalQuantity: 0, unit: '', purchased: false },
    { id: 'item_016', name: 'Caesar Dressing', category: 'seasonings', totalQuantity: 0, unit: '', purchased: false },
  ],
};

// Update mockCurrentMenuBook with shoppingList after it's defined
// This creates a complete MenuBook with both mealPlan and shoppingList
export const mockCompleteMenuBook: MenuBook = {
  ...mockCurrentMenuBook,
  shoppingList: mockShoppingList,
};

// ============================================
// Draft Store Mock (Create Flow)
// ============================================

export const mockEmptyDraft = {
  currentStep: 1,
  keywords: [] as string[],
  mustHaveItems: [] as string[],
  dislikedItems: [] as string[],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium' as Difficulty,
  cookSchedule: mockDefaultCookSchedule,
  lastUpdated: new Date().toISOString(),
};

export const mockPartialDraft = {
  currentStep: 4,
  keywords: ['Quick', 'Healthy', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken'],
  dislikedItems: ['Mushrooms'],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium' as Difficulty,
  cookSchedule: mockDefaultCookSchedule,
  lastUpdated: new Date().toISOString(),
};

export const mockCompleteDraft = {
  currentStep: 6,
  keywords: ['Quick', 'Healthy', 'High-Protein', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken', 'Rice'],
  dislikedItems: ['Mushrooms', 'Cilantro'],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium' as Difficulty,
  cookSchedule: {
    monday: { breakfast: false, lunch: true, dinner: true },
    tuesday: { breakfast: false, lunch: true, dinner: true },
    wednesday: { breakfast: false, lunch: true, dinner: true },
    thursday: { breakfast: false, lunch: true, dinner: true },
    friday: { breakfast: false, lunch: true, dinner: true },
    saturday: { breakfast: true, lunch: true, dinner: true },
    sunday: { breakfast: true, lunch: true, dinner: false },
  },
  lastUpdated: new Date().toISOString(),
};

// ============================================
// API Response Mocks
// ============================================

export const mockApiResponses = {
  generateMealPlan: {
    success: mockMealPlan,
    error: {
      error: {
        code: 'GEMINI_ERROR',
        message: 'Failed to generate meal plan',
        details: [],
      },
    },
    timeout: null, // Used for timeout simulation
  },
  
  modifyMealPlan: {
    success: {
      ...mockMealPlan,
      id: 'mp_abc123_modified',
    },
    error: {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to modify meal plan',
        details: [{ field: 'modification', message: 'Modification text is required' }],
      },
    },
  },
  
  generateShoppingList: {
    success: mockShoppingList,
    error: {
      error: {
        code: 'GEMINI_ERROR',
        message: 'Failed to generate shopping list',
        details: [],
      },
    },
  },
  
  healthCheck: {
    success: {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  },
};

// ============================================
// Keywords/Tags Mock
// ============================================

export const mockKeywordCategories = {
  cookingStyle: {
    label: 'Cooking Style',
    items: ['Quick', 'Easy', 'One-Pot', 'Sheet Pan', 'Slow Cooker', 'Instant Pot', 'Grilling', 'Meal Prep', 'Under 30 Min', 'Weeknight'],
  },
  dietHealth: {
    label: 'Diet & Health',
    items: ['Healthy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free', 'Low-Carb', 'Keto', 'High-Protein', 'Low-Sodium', 'Heart-Healthy'],
  },
  cuisine: {
    label: 'Cuisine',
    items: ['American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Korean', 'Vietnamese', 'Mediterranean'],
  },
  other: {
    label: 'Other',
    items: ['Kid-Friendly', 'Family-Style', 'Comfort Food', 'Budget-Friendly'],
  },
};

export const mockIngredientCategories = {
  proteins: ['Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Tofu', 'Eggs'],
  vegetables: ['Broccoli', 'Carrots', 'Spinach', 'Tomatoes', 'Bell Peppers', 'Onions', 'Garlic'],
  grains: ['Rice', 'Pasta', 'Bread', 'Quinoa', 'Noodles'],
  dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter'],
};

// ============================================
// Test Helper Functions
// ============================================

/**
 * Generate mock menu books for a given count
 */
export function generateMockMenuBooks(count: number) {
  const books = [];
  const today = new Date('2025-01-27');
  
  for (let i = 0; i < count; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    books.push({
      id: `book-${i + 1}`,
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      mealPlan: { ...mockMealPlan, id: `mp_${String(i + 1).padStart(3, '0')}` },
      foodEmojis: getRandomFoodEmojis(),
      createdAt: weekStart.toISOString(),
    });
  }
  
  return books;
}

/**
 * Generate random food emoji combinations
 */
function getRandomFoodEmojis(): string {
  const emojis = ['🥚', '🥗', '🥩', '🍚', '🥦', '🍳', '🍝', '🍗', '🥕', '🥐', '🧀', '🍲', '🍜', '🥟', '🥬', '🍛', '🥒', '🍤'];
  const selected: string[] = [];
  
  for (let i = 0; i < 6; i++) {
    selected.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }
  
  return selected.slice(0, 3).join('') + '\n' + selected.slice(3, 6).join('');
}

/**
 * Count total meals in a meal plan
 */
export function countMealsInPlan(plan: MealPlan): number {
  let count = 0;
  Object.values(plan.days).forEach(day => {
    if (day.breakfast) count++;
    if (day.lunch) count++;
    if (day.dinner) count++;
  });
  return count;
}

/**
 * Calculate total calories for a meal plan
 */
export function calculateTotalCalories(plan: MealPlan): number {
  let total = 0;
  Object.values(plan.days).forEach(day => {
    if (day.breakfast) total += day.breakfast.totalCalories;
    if (day.lunch) total += day.lunch.totalCalories;
    if (day.dinner) total += day.dinner.totalCalories;
  });
  return total;
}

/**
 * Calculate total calories for a specific day
 */
export function calculateDayCalories(day: DayMeals): number {
  let total = 0;
  if (day.breakfast) total += day.breakfast.totalCalories;
  if (day.lunch) total += day.lunch.totalCalories;
  if (day.dinner) total += day.dinner.totalCalories;
  return total;
}

/**
 * Count meals for a specific day
 */
export function countMealsInDay(day: DayMeals): number {
  let count = 0;
  if (day.breakfast) count++;
  if (day.lunch) count++;
  if (day.dinner) count++;
  return count;
}

/**
 * Create a mock meal plan with custom overrides
 */
export function createMockMealPlan(overrides: Partial<MealPlan> = {}): MealPlan {
  return {
    ...mockMealPlan,
    ...overrides,
    id: overrides.id || `mp_${Date.now()}`,
    createdAt: overrides.createdAt || new Date().toISOString(),
  };
}

/**
 * Create a mock shopping list with custom overrides
 */
export function createMockShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
  return {
    ...mockShoppingList,
    ...overrides,
    id: overrides.id || `sl_${Date.now()}`,
    createdAt: overrides.createdAt || new Date().toISOString(),
  };
}

/**
 * Create a mock recipe with custom overrides
 */
export function createMockRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: `recipe_${Date.now()}`,
    name: 'Test Recipe',
    estimatedTime: 20,
    servings: 2,
    totalCalories: 400,
    difficulty: 'easy',
    ingredients: [],
    instructions: '',
    notes: '',
    ...overrides,
  };
}

/**
 * Group shopping items by category (for UI display)
 */
export function groupShoppingItemsByCategory(items: ShoppingItem[]): Record<IngredientCategory, ShoppingItem[]> {
  const grouped: Record<string, ShoppingItem[]> = {};
  
  INGREDIENT_CATEGORIES.forEach(category => {
    grouped[category] = [];
  });
  
  items.forEach(item => {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    } else {
      grouped['others'].push(item);
    }
  });
  
  return grouped as Record<IngredientCategory, ShoppingItem[]>;
}
