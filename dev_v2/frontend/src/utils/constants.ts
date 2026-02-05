export const MENU_CLOSED_SURFACES = [
  "bg-gradient-to-br from-[#FAF8F5] to-[#F0EDE8]",
  "bg-gradient-to-br from-[#F7F1E8] to-[#EDE3D4]",
  "bg-gradient-to-br from-[#F6EEE4] to-[#E9DDCF]",
  "bg-gradient-to-br from-[#F9F4EC] to-[#EFE6DA]",
  "bg-gradient-to-br from-[#F4ECE2] to-[#E7DACB]",
] as const;

export const MENU_CLOSED_EMOJI_FALLBACK = ["🍽️", "🥗", "🍲", "🥘", "🍱", "🥪"] as const;

export const PREFERENCE_TAGS = [
  { label: "Veggies with every meal", icon: "🥦" },
  { label: "Ready in 15 mins", icon: "⏱️" },
  { label: "Minimal cleanup", icon: "🧽" },
  { label: "Budget-friendly", icon: "💰" },
  { label: "Asian flavors", icon: "🍜" },
  { label: "No-cook meal", icon: "🥗" },
  { label: "Not too oily", icon: "🫒" },
  { label: "Always include protein", icon: "💪" },
  { label: "Fresh ingredients only", icon: "🥬" },
  { label: "Extra fiber", icon: "🌾" },
  { label: "Seasonal produce", icon: "🍂" },
  { label: "No heavy sauces", icon: "🥫" },
] as const;

export const DISLIKE_TAGS = [
  { label: "No cilantro", icon: "🌿" },
  { label: "No spicy food", icon: "🌶️" },
  { label: "I hate onions", icon: "🧅" },
  { label: "Not too sweet", icon: "🍬" },
  { label: "Dairy-free", icon: "🥛" },
  { label: "No heavy frying", icon: "🛢️" },
  { label: "Nut-free", icon: "🥜" },
] as const;

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
