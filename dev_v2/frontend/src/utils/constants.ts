export const MENU_CLOSED_GRADIENTS = [
  "from-[#fef3c7] to-[#fca5a5]",
  "from-[#bfdbfe] to-[#c4b5fd]",
  "from-[#bbf7d0] to-[#86efac]",
  "from-[#c7d2fe] to-[#fbcfe8]",
  "from-[#fde68a] to-[#bef264]",
] as const;

export const MENU_CLOSED_EMOJI_FALLBACK = ["🍽️", "🥗", "🍲", "🥘", "🍱", "🥪"] as const;

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
