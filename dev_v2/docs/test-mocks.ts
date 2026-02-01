/**
 * OMenu Test Mock Data
 * 用于单元测试、集成测试和 E2E 测试的模拟数据
 */

// ============================================
// 基础类型 Mock
// ============================================

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

// ============================================
// Meal (单个餐食) Mock
// ============================================

export const mockBreakfast = {
  id: 'meal-breakfast-1',
  name: 'Scrambled Eggs with Tomato',
  cookTime: 15,
  servings: 2,
  calories: 320,
  difficulty: 'easy',
  ingredients: [
    { name: 'eggs', amount: '4', unit: 'count' },
    { name: 'tomatoes', amount: '2', unit: 'medium' },
    { name: 'vegetable oil', amount: '1', unit: 'tbsp' },
    { name: 'salt', amount: '', unit: 'to taste' },
    { name: 'green onions', amount: '2', unit: 'stalks' },
  ],
  instructions: [
    'Beat eggs with a pinch of salt in a bowl',
    'Dice tomatoes into small pieces',
    'Heat oil in a pan over medium heat',
    'Pour in eggs and scramble until just set',
    'Add tomatoes, mix gently, and serve',
  ],
  notes: 'Add a pinch of sugar for better taste',
};

export const mockLunch = {
  id: 'meal-lunch-1',
  name: 'Chicken Caesar Salad',
  cookTime: 20,
  servings: 2,
  calories: 450,
  difficulty: 'easy',
  ingredients: [
    { name: 'chicken breast', amount: '1', unit: 'lb' },
    { name: 'romaine lettuce', amount: '1', unit: 'head' },
    { name: 'parmesan cheese', amount: '1/2', unit: 'cup' },
    { name: 'caesar dressing', amount: '4', unit: 'tbsp' },
    { name: 'croutons', amount: '1', unit: 'cup' },
  ],
  instructions: [
    'Season and grill chicken breast until cooked',
    'Let chicken rest, then slice',
    'Chop romaine lettuce and place in bowl',
    'Add sliced chicken, parmesan, and croutons',
    'Drizzle with caesar dressing and toss',
  ],
  notes: '',
};

export const mockDinner = {
  id: 'meal-dinner-1',
  name: 'Beef Stir-fry with Rice',
  cookTime: 30,
  servings: 2,
  calories: 580,
  difficulty: 'medium',
  ingredients: [
    { name: 'beef sirloin', amount: '1', unit: 'lb' },
    { name: 'jasmine rice', amount: '2', unit: 'cups' },
    { name: 'bell peppers', amount: '2', unit: 'count' },
    { name: 'broccoli', amount: '1', unit: 'cup' },
    { name: 'soy sauce', amount: '3', unit: 'tbsp' },
    { name: 'garlic', amount: '3', unit: 'cloves' },
    { name: 'ginger', amount: '1', unit: 'inch' },
  ],
  instructions: [
    'Cook rice according to package instructions',
    'Slice beef into thin strips',
    'Cut vegetables into bite-sized pieces',
    'Stir-fry beef in hot oil until browned',
    'Add vegetables and sauce, cook until tender',
    'Serve over rice',
  ],
  notes: 'Can substitute with chicken or tofu',
};

export const mockEmptyMeal = null;

// ============================================
// Day (单日餐食) Mock
// ============================================

export const mockMondayFull = {
  breakfast: mockBreakfast,
  lunch: mockLunch,
  dinner: mockDinner,
};

export const mockTuesdayPartial = {
  breakfast: null,
  lunch: {
    id: 'meal-lunch-2',
    name: 'Turkey Club Sandwich',
    cookTime: 10,
    servings: 2,
    calories: 380,
    difficulty: 'easy',
    ingredients: [
      { name: 'turkey slices', amount: '6', unit: 'oz' },
      { name: 'bread', amount: '3', unit: 'slices' },
      { name: 'bacon', amount: '4', unit: 'strips' },
      { name: 'lettuce', amount: '2', unit: 'leaves' },
      { name: 'tomato', amount: '1', unit: 'medium' },
      { name: 'mayo', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Toast bread slices',
      'Cook bacon until crispy',
      'Layer turkey, bacon, lettuce, and tomato',
      'Spread mayo and assemble sandwich',
    ],
    notes: '',
  },
  dinner: {
    id: 'meal-dinner-2',
    name: 'Salmon with Asparagus',
    cookTime: 25,
    servings: 2,
    calories: 490,
    difficulty: 'medium',
    ingredients: [
      { name: 'salmon fillet', amount: '1', unit: 'lb' },
      { name: 'asparagus', amount: '1', unit: 'bunch' },
      { name: 'lemon', amount: '1', unit: 'count' },
      { name: 'olive oil', amount: '2', unit: 'tbsp' },
      { name: 'garlic', amount: '2', unit: 'cloves' },
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Season salmon with salt, pepper, and lemon',
      'Toss asparagus with olive oil and garlic',
      'Bake salmon and asparagus for 15-20 minutes',
      'Serve with lemon wedges',
    ],
    notes: '',
  },
};

export const mockEmptyDay = {
  breakfast: null,
  lunch: null,
  dinner: null,
};

// ============================================
// Meal Plan (完整周计划) Mock
// ============================================

export const mockMealPlan = {
  id: 'plan-001',
  weekStartDate: '2025-01-27',
  weekEndDate: '2025-02-02',
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  keywords: ['Quick', 'Healthy', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken', 'Rice'],
  dislikedItems: ['Mushrooms', 'Cilantro'],
  days: {
    monday: mockMondayFull,
    tuesday: mockTuesdayPartial,
    wednesday: {
      breakfast: null,
      lunch: {
        id: 'meal-lunch-3',
        name: 'Vegetable Fried Rice',
        cookTime: 20,
        servings: 2,
        calories: 420,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      dinner: {
        id: 'meal-dinner-3',
        name: 'Honey Garlic Chicken',
        cookTime: 35,
        servings: 2,
        calories: 520,
        difficulty: 'medium',
        ingredients: [],
        instructions: [],
        notes: '',
      },
    },
    thursday: {
      breakfast: null,
      lunch: {
        id: 'meal-lunch-4',
        name: 'Tuna Salad Wrap',
        cookTime: 10,
        servings: 2,
        calories: 350,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      dinner: {
        id: 'meal-dinner-4',
        name: 'Pasta Primavera',
        cookTime: 25,
        servings: 2,
        calories: 480,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
    },
    friday: {
      breakfast: null,
      lunch: {
        id: 'meal-lunch-5',
        name: 'Greek Salad with Pita',
        cookTime: 15,
        servings: 2,
        calories: 380,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      dinner: {
        id: 'meal-dinner-5',
        name: 'Fish Tacos',
        cookTime: 30,
        servings: 2,
        calories: 550,
        difficulty: 'medium',
        ingredients: [],
        instructions: [],
        notes: '',
      },
    },
    saturday: {
      breakfast: {
        id: 'meal-breakfast-6',
        name: 'Pancakes with Berries',
        cookTime: 20,
        servings: 2,
        calories: 450,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      lunch: {
        id: 'meal-lunch-6',
        name: 'BLT Sandwich',
        cookTime: 10,
        servings: 2,
        calories: 400,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      dinner: {
        id: 'meal-dinner-6',
        name: 'Grilled Steak with Potatoes',
        cookTime: 40,
        servings: 2,
        calories: 680,
        difficulty: 'medium',
        ingredients: [],
        instructions: [],
        notes: '',
      },
    },
    sunday: {
      breakfast: {
        id: 'meal-breakfast-7',
        name: 'Avocado Toast with Eggs',
        cookTime: 15,
        servings: 2,
        calories: 380,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      lunch: {
        id: 'meal-lunch-7',
        name: 'Chicken Noodle Soup',
        cookTime: 30,
        servings: 2,
        calories: 350,
        difficulty: 'easy',
        ingredients: [],
        instructions: [],
        notes: '',
      },
      dinner: null,
    },
  },
  createdAt: '2025-01-27T10:00:00Z',
  updatedAt: '2025-01-27T10:00:00Z',
};

// ============================================
// Menu Book Mock
// ============================================

export const mockCurrentMenuBook = {
  id: 'book-001',
  weekStartDate: '2025-01-27',
  weekEndDate: '2025-02-02',
  mealPlan: mockMealPlan,
  foodEmojis: '🥚🥗🥩\n🍚🥦🍳',
  createdAt: '2025-01-27T10:00:00Z',
};

export const mockPastMenuBook1 = {
  id: 'book-002',
  weekStartDate: '2025-01-20',
  weekEndDate: '2025-01-26',
  mealPlan: { ...mockMealPlan, id: 'plan-002' },
  foodEmojis: '🍝🍗🥕\n🥐🧀🍲',
  createdAt: '2025-01-20T10:00:00Z',
};

export const mockPastMenuBook2 = {
  id: 'book-003',
  weekStartDate: '2025-01-13',
  weekEndDate: '2025-01-19',
  mealPlan: { ...mockMealPlan, id: 'plan-003' },
  foodEmojis: '🍜🥟🥬\n🍛🥒🍤',
  createdAt: '2025-01-13T10:00:00Z',
};

export const mockMenuBooks = [
  mockCurrentMenuBook,
  mockPastMenuBook1,
  mockPastMenuBook2,
];

// ============================================
// Shopping List Mock
// ============================================

export const mockShoppingList = {
  id: 'list-001',
  mealPlanId: 'plan-001',
  categories: {
    proteins: {
      label: '🥩 Proteins',
      items: [
        { id: 'item-1', name: 'Chicken Breast', quantity: '2 lbs', checked: false },
        { id: 'item-2', name: 'Ground Beef', quantity: '1 lb', checked: false },
        { id: 'item-3', name: 'Salmon Fillet', quantity: '1 lb', checked: true },
        { id: 'item-4', name: 'Turkey Slices', quantity: '6 oz', checked: false },
      ],
    },
    vegetables: {
      label: '🥬 Vegetables',
      items: [
        { id: 'item-5', name: 'Romaine Lettuce', quantity: '2 heads', checked: false },
        { id: 'item-6', name: 'Tomatoes', quantity: '6 count', checked: false },
        { id: 'item-7', name: 'Asparagus', quantity: '1 bunch', checked: true },
        { id: 'item-8', name: 'Bell Peppers', quantity: '3 count', checked: false },
        { id: 'item-9', name: 'Broccoli', quantity: '2 cups', checked: false },
      ],
    },
    dairy: {
      label: '🧀 Dairy',
      items: [
        { id: 'item-10', name: 'Eggs', quantity: '1 dozen', checked: false },
        { id: 'item-11', name: 'Parmesan Cheese', quantity: '1/2 cup', checked: false },
      ],
    },
    grains: {
      label: '🍚 Grains',
      items: [
        { id: 'item-12', name: 'Jasmine Rice', quantity: '2 cups', checked: false },
        { id: 'item-13', name: 'Bread', quantity: '1 loaf', checked: false },
      ],
    },
    seasonings: {
      label: '🧂 Seasonings',
      items: [
        { id: 'item-14', name: 'Soy Sauce', quantity: '', checked: false },
        { id: 'item-15', name: 'Olive Oil', quantity: '', checked: false },
        { id: 'item-16', name: 'Garlic', quantity: '1 head', checked: false },
      ],
    },
  },
  createdAt: '2025-01-27T10:30:00Z',
};

// ============================================
// Draft Store Mock (Create Flow)
// ============================================

export const mockEmptyDraft = {
  currentStep: 1,
  keywords: [],
  mustHaveItems: [],
  dislikedItems: [],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  cookSchedule: {
    monday: { breakfast: false, lunch: true, dinner: true },
    tuesday: { breakfast: false, lunch: true, dinner: true },
    wednesday: { breakfast: false, lunch: true, dinner: true },
    thursday: { breakfast: false, lunch: true, dinner: true },
    friday: { breakfast: false, lunch: true, dinner: true },
    saturday: { breakfast: true, lunch: true, dinner: true },
    sunday: { breakfast: true, lunch: true, dinner: false },
  },
};

export const mockPartialDraft = {
  currentStep: 4,
  keywords: ['Quick', 'Healthy', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken'],
  dislikedItems: ['Mushrooms'],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  cookSchedule: mockEmptyDraft.cookSchedule,
};

export const mockCompleteDraft = {
  currentStep: 6,
  keywords: ['Quick', 'Healthy', 'High-Protein', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken', 'Rice'],
  dislikedItems: ['Mushrooms', 'Cilantro'],
  numPeople: 2,
  budget: 100,
  difficulty: 'medium',
  cookSchedule: {
    monday: { breakfast: false, lunch: true, dinner: true },
    tuesday: { breakfast: false, lunch: true, dinner: true },
    wednesday: { breakfast: false, lunch: true, dinner: true },
    thursday: { breakfast: false, lunch: true, dinner: true },
    friday: { breakfast: false, lunch: true, dinner: true },
    saturday: { breakfast: true, lunch: true, dinner: true },
    sunday: { breakfast: true, lunch: true, dinner: false },
  },
};

// ============================================
// User Preferences Mock
// ============================================

export const mockUserPreferences = {
  keywords: ['Quick', 'Healthy', 'High-Protein', 'Chinese'],
  mustHaveItems: ['Eggs', 'Chicken', 'Rice'],
  dislikedItems: ['Mushrooms', 'Cilantro'],
  defaultNumPeople: 2,
  defaultBudget: 100,
  defaultDifficulty: 'medium',
};

// ============================================
// API Response Mocks
// ============================================

export const mockApiResponses = {
  generateMealPlan: {
    success: mockMealPlan,
    error: {
      error: 'Failed to generate meal plan',
      message: 'Internal Server Error',
      code: 500,
    },
    timeout: null, // 用于模拟超时
  },
  
  modifyMealPlan: {
    success: {
      ...mockMealPlan,
      id: 'plan-001-modified',
      updatedAt: new Date().toISOString(),
    },
    error: {
      error: 'Failed to modify meal plan',
      message: 'Bad Request',
      code: 400,
    },
  },
  
  generateShoppingList: {
    success: mockShoppingList,
    error: {
      error: 'Failed to generate shopping list',
      message: 'Internal Server Error',
      code: 500,
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
 * 生成指定数量的 Mock 菜单本
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
      mealPlan: { ...mockMealPlan, id: `plan-${i + 1}` },
      foodEmojis: getRandomFoodEmojis(),
      createdAt: weekStart.toISOString(),
    });
  }
  
  return books;
}

/**
 * 生成随机食物 emoji 组合
 */
function getRandomFoodEmojis() {
  const emojis = ['🥚', '🥗', '🥩', '🍚', '🥦', '🍳', '🍝', '🍗', '🥕', '🥐', '🧀', '🍲', '🍜', '🥟', '🥬', '🍛', '🥒', '🍤'];
  const selected = [];
  
  for (let i = 0; i < 6; i++) {
    selected.push(emojis[Math.floor(Math.random() * emojis.length)]);
  }
  
  return selected.slice(0, 3).join('') + '\n' + selected.slice(3, 6).join('');
}

/**
 * 计算 Mock 计划的总餐数
 */
export function countMealsInPlan(plan: typeof mockMealPlan): number {
  let count = 0;
  Object.values(plan.days).forEach(day => {
    if (day.breakfast) count++;
    if (day.lunch) count++;
    if (day.dinner) count++;
  });
  return count;
}

/**
 * 计算 Mock 计划的总卡路里
 */
export function calculateTotalCalories(plan: typeof mockMealPlan): number {
  let total = 0;
  Object.values(plan.days).forEach(day => {
    if (day.breakfast) total += day.breakfast.calories;
    if (day.lunch) total += day.lunch.calories;
    if (day.dinner) total += day.dinner.calories;
  });
  return total;
}

/**
 * 创建带有自定义数据的 Mock 计划
 */
export function createMockMealPlan(overrides: Partial<typeof mockMealPlan> = {}) {
  return {
    ...mockMealPlan,
    ...overrides,
    id: overrides.id || `plan-${Date.now()}`,
  };
}

/**
 * 创建带有自定义数据的 Mock 购物清单
 */
export function createMockShoppingList(overrides: Partial<typeof mockShoppingList> = {}) {
  return {
    ...mockShoppingList,
    ...overrides,
    id: overrides.id || `list-${Date.now()}`,
  };
}
