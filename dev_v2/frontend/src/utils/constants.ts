import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Beef,
  Candy,
  Carrot,
  Coins,
  CookingPot,
  Droplet,
  EggFried,
  Flame,
  Leaf,
  LeafyGreen,
  Milk,
  MilkOff,
  NutOff,
  Package,
  Pizza,
  Salad,
  Soup,
  Sparkles,
  Sprout,
  Timer,
  Utensils,
  Wheat,
} from "lucide-react";
import type { IngredientCategory } from "@/types";

export const MENU_CLOSED_SURFACES = [
  "bg-gradient-to-br from-[#F7F2EC] to-[#EEE7DD]",
  "bg-gradient-to-br from-[#F7F1ED] to-[#EEE6DB]",
  "bg-gradient-to-br from-[#F6F1EB] to-[#EEE6DC]",
  "bg-gradient-to-br from-[#F7F2EC] to-[#EFE7DD]",
  "bg-gradient-to-br from-[#F6F1EB] to-[#EEE6DA]",
] as const;

export const MENU_CLOSED_ICON_FALLBACK: LucideIcon[] = [
  Utensils,
  Salad,
  Soup,
  CookingPot,
  Pizza,
  Apple,
];

export const PREFERENCE_TAGS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Veggies with every meal", icon: LeafyGreen },
  { label: "Ready in 15 mins", icon: Timer },
  { label: "Minimal cleanup", icon: Sparkles },
  { label: "Budget-friendly", icon: Coins },
  { label: "Asian flavors", icon: Soup },
  { label: "No-cook meal", icon: Salad },
  { label: "Not too oily", icon: Droplet },
  { label: "Always include protein", icon: Beef },
  { label: "Fresh ingredients only", icon: Leaf },
  { label: "Extra fiber", icon: Wheat },
  { label: "Seasonal produce", icon: Sprout },
  { label: "No heavy sauces", icon: CookingPot },
];

export const DISLIKE_TAGS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "No cilantro", icon: Leaf },
  { label: "No spicy food", icon: Flame },
  { label: "I hate onions", icon: Carrot },
  { label: "Not too sweet", icon: Candy },
  { label: "Dairy-free", icon: MilkOff },
  { label: "No heavy frying", icon: EggFried },
  { label: "Nut-free", icon: NutOff },
];

export const INGREDIENT_CATEGORY_DETAILS: Record<IngredientCategory, { label: string; icon: LucideIcon }> = {
  proteins: { label: "Proteins", icon: Beef },
  vegetables: { label: "Vegetables", icon: LeafyGreen },
  fruits: { label: "Fruits", icon: Apple },
  grains: { label: "Grains", icon: Wheat },
  dairy: { label: "Dairy", icon: Milk },
  seasonings: { label: "Seasonings", icon: Leaf },
  pantry_staples: { label: "Pantry Staples", icon: Package },
  others: { label: "Others", icon: Utensils },
};

export const INGREDIENT_CATEGORIES = [
  "proteins",
  "vegetables",
  "fruits",
  "grains",
  "dairy",
  "seasonings",
  "pantry_staples",
  "others",
] as const;

export const DEFAULT_NUM_PEOPLE = 2;
export const DEFAULT_BUDGET = 120;
export const MAX_KEYWORDS = 8;
export const MAX_MUST_HAVE_ITEMS = 6;
export const MAX_DISLIKED_ITEMS = 6;

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
