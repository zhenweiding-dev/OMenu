import { addWeeks, startOfWeek } from "date-fns";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";
import type { MenuBook } from "@/types";

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildMockBook(offsetWeeks: number): MenuBook {
  const weekStart = startOfWeek(addWeeks(new Date(), offsetWeeks), { weekStartsOn: 1 });
  const isoWeekStart = weekStart.toISOString();
  const idSuffix = isoWeekStart.slice(0, 10).replace(/-/g, "");
  const mealPlanId = `mock_mealplan_${idSuffix}_${offsetWeeks}`;
  const shoppingListId = `mock_list_${idSuffix}_${offsetWeeks}`;

  const base = clone(SAMPLE_MENU_BOOK);
  return {
    ...base,
    id: `mock_book_${idSuffix}_${offsetWeeks}`,
    mealPlan: {
      ...base.mealPlan,
      id: mealPlanId,
      createdAt: isoWeekStart,
    },
    shoppingList: {
      ...base.shoppingList,
      id: shoppingListId,
      mealPlanId,
      createdAt: isoWeekStart,
    },
  };
}

export function buildMockMenuBooks(): MenuBook[] {
  return [buildMockBook(0), buildMockBook(-1), buildMockBook(1)];
}
