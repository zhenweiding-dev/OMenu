import { useMemo } from "react";
import {
  Apple,
  Beef,
  Carrot,
  ChefHat,
  CookingPot,
  LeafyGreen,
  Milk,
  Pizza,
  Salad,
  Soup,
  Utensils,
  Wheat,
} from "lucide-react";
import { cn } from "@/utils/cn";

const FOOD_ICONS = [
  ChefHat,
  Salad,
  Soup,
  Pizza,
  Apple,
  Carrot,
  LeafyGreen,
  Wheat,
  Milk,
  Beef,
  CookingPot,
  Utensils,
];

const ICON_POSITIONS = [
  { top: "7%", left: "10%", size: "h-6 w-6", rotate: "-8deg", opacity: "opacity-20" },
  { top: "16%", left: "76%", size: "h-5 w-5", rotate: "10deg", opacity: "opacity-20" },
  { top: "28%", left: "16%", size: "h-7 w-7", rotate: "4deg", opacity: "opacity-20" },
  { top: "34%", left: "84%", size: "h-6 w-6", rotate: "-6deg", opacity: "opacity-20" },
  { top: "52%", left: "8%", size: "h-5 w-5", rotate: "12deg", opacity: "opacity-20" },
  { top: "60%", left: "74%", size: "h-7 w-7", rotate: "-4deg", opacity: "opacity-20" },
  { top: "74%", left: "14%", size: "h-6 w-6", rotate: "8deg", opacity: "opacity-20" },
  { top: "84%", left: "72%", size: "h-6 w-6", rotate: "-6deg", opacity: "opacity-20" },
];

export function BackgroundFoodIcons() {
  const placements = useMemo(() => {
    const seed = Math.floor(Math.random() * FOOD_ICONS.length);
    return ICON_POSITIONS.map((position, index) => ({
      ...position,
      Icon: FOOD_ICONS[(index + seed) % FOOD_ICONS.length],
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {placements.map(({ Icon, top, left, size, rotate, opacity }, index) => (
        <Icon
          key={`${Icon.displayName ?? "food"}-${index}`}
          className={cn("absolute text-accent-base/40 ui-icon-subtle", size, opacity)}
          style={{ top, left, transform: `rotate(${rotate})` }}
          aria-hidden
        />
      ))}
    </div>
  );
}
