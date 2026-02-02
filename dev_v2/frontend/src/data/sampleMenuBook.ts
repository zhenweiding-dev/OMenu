import type { MenuBook, Recipe } from "@/types";

const breakfastRecipe: Recipe = {
  id: "recipe_avocado_toast",
  name: "Avocado Toast with Eggs",
  ingredients: [
    { name: "Sourdough bread", quantity: 2, unit: "slices", category: "grains" },
    { name: "Avocado", quantity: 1, unit: "", category: "fruits" },
    { name: "Egg", quantity: 2, unit: "", category: "proteins" },
    { name: "Lemon juice", quantity: 1, unit: "tsp", category: "seasonings" },
    { name: "Chili flakes", quantity: 0, unit: "", category: "seasonings" },
  ],
  instructions:
    "Toast bread. Mash avocado with lemon juice and spread over toast. Top with fried eggs and sprinkle chili flakes.",
  estimatedTime: 15,
  servings: 1,
  difficulty: "easy",
  totalCalories: 320,
};

const lunchRecipe: Recipe = {
  id: "recipe_chicken_salad",
  name: "Herbed Chicken Salad Bowl",
  ingredients: [
    { name: "Chicken breast", quantity: 1, unit: "lb", category: "proteins" },
    { name: "Spring greens", quantity: 4, unit: "cups", category: "vegetables" },
    { name: "Cherry tomatoes", quantity: 1, unit: "cup", category: "vegetables" },
    { name: "Quinoa", quantity: 1, unit: "cup", category: "grains" },
    { name: "Feta cheese", quantity: 0.5, unit: "cup", category: "dairy" },
    { name: "Lemon vinaigrette", quantity: 0, unit: "", category: "seasonings" },
  ],
  instructions:
    "Cook quinoa. Grill chicken with herbs. Toss greens, tomatoes, quinoa, and feta with vinaigrette. Slice chicken and serve on top.",
  estimatedTime: 30,
  servings: 2,
  difficulty: "medium",
  totalCalories: 540,
};

const dinnerRecipe: Recipe = {
  id: "recipe_salmon",
  name: "Citrus Herb Salmon",
  ingredients: [
    { name: "Salmon fillet", quantity: 4, unit: "oz", category: "proteins" },
    { name: "Asparagus", quantity: 12, unit: "spears", category: "vegetables" },
    { name: "Orange", quantity: 1, unit: "", category: "fruits" },
    { name: "Olive oil", quantity: 2, unit: "tbsp", category: "pantry_staples" },
    { name: "Garlic", quantity: 2, unit: "cloves", category: "vegetables" },
    { name: "Fresh dill", quantity: 0, unit: "", category: "seasonings" },
  ],
  instructions:
    "Preheat oven to 400°F. Arrange salmon and asparagus on tray. Drizzle olive oil, orange zest, and garlic. Roast 12 minutes and finish with dill.",
  estimatedTime: 25,
  servings: 2,
  difficulty: "easy",
  totalCalories: 610,
};

function buildDayMeals() {
  return {
    breakfast: { ...breakfastRecipe },
    lunch: { ...lunchRecipe },
    dinner: { ...dinnerRecipe },
  } as const;
}

export const SAMPLE_MENU_BOOK: MenuBook = {
  id: "demo_week_01",
  mealPlan: {
    id: "mealplan_demo_01",
    createdAt: "2026-01-29T08:00:00.000Z",
    status: "ready",
    preferences: {
      keywords: ["Healthy", "Quick"],
      mustHaveItems: ["Avocado"],
      dislikedItems: ["Mushrooms"],
      numPeople: 2,
      budget: 120,
      difficulty: "easy",
      cookSchedule: {
        monday: { breakfast: true, lunch: true, dinner: true },
        tuesday: { breakfast: true, lunch: true, dinner: true },
        wednesday: { breakfast: true, lunch: true, dinner: true },
        thursday: { breakfast: true, lunch: true, dinner: true },
        friday: { breakfast: true, lunch: true, dinner: true },
        saturday: { breakfast: true, lunch: true, dinner: true },
        sunday: { breakfast: true, lunch: true, dinner: true },
      },
    },
    days: {
      monday: buildDayMeals(),
      tuesday: buildDayMeals(),
      wednesday: buildDayMeals(),
      thursday: buildDayMeals(),
      friday: buildDayMeals(),
      saturday: buildDayMeals(),
      sunday: buildDayMeals(),
    },
  },
  shoppingList: {
    id: "shopping_demo_01",
    mealPlanId: "mealplan_demo_01",
    createdAt: "2026-01-29T09:00:00.000Z",
    items: [
      {
        id: "item_bread",
        name: "Sourdough bread",
        category: "grains",
        totalQuantity: 1,
        unit: "loaf",
        purchased: false,
      },
      {
        id: "item_avocado",
        name: "Avocados",
        category: "fruits",
        totalQuantity: 4,
        unit: "",
        purchased: false,
      },
      {
        id: "item_eggs",
        name: "Eggs",
        category: "proteins",
        totalQuantity: 12,
        unit: "count",
        purchased: false,
      },
      {
        id: "item_salmon",
        name: "Salmon fillet",
        category: "proteins",
        totalQuantity: 4,
        unit: "oz",
        purchased: false,
      },
      {
        id: "item_asparagus",
        name: "Asparagus",
        category: "vegetables",
        totalQuantity: 1,
        unit: "bunch",
        purchased: false,
      },
      {
        id: "item_quinoa",
        name: "Quinoa",
        category: "grains",
        totalQuantity: 2,
        unit: "cups",
        purchased: false,
      },
      {
        id: "item_vinaigrette",
        name: "Lemon vinaigrette",
        category: "seasonings",
        totalQuantity: 0,
        unit: "",
        purchased: false,
      },
      {
        id: "item_olive_oil",
        name: "Olive oil",
        category: "pantry_staples",
        totalQuantity: 1,
        unit: "bottle",
        purchased: false,
      },
    ],
  },
};
