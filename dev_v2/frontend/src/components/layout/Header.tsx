import { useLocation } from "react-router-dom";
import { getRelativeWeekLabel, getWeekDateRange } from "@/utils/helpers";
import { useAppStore } from "@/stores/useAppStore";
import { useShoppingStore } from "@/stores/useShoppingStore";

const ROUTE_TITLES: Record<string, string> = {
  "/shopping": "Shopping List",
  "/me": "Profile",
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const setIsMenuPickerOpen = useAppStore((state) => state.setIsMenuPickerOpen);
  const setShowAddItemModal = useShoppingStore((state) => state.setShowAddItemModal);

  if (pathname === "/create") {
    return null;
  }

  if (pathname === "/") {
    const relativeWeekLabel = currentBook ? getRelativeWeekLabel(currentBook.mealPlan.createdAt) : "WELCOME";
    const currentWeekRange = currentBook ? getWeekDateRange(currentBook.mealPlan.createdAt) : null;

    return (
      <header className="sticky top-0 z-40 bg-paper-base">
        <div className="px-5 pb-4 pt-14">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">
                {relativeWeekLabel}
              </p>
              {currentWeekRange && <p className="mt-1 text-[11px] text-text-secondary">{currentWeekRange}</p>}
            </div>
            <button
              type="button"
              onClick={() => setIsMenuPickerOpen(true)}
              aria-label="Open menu book picker"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-base shadow-btn"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  const title = ROUTE_TITLES[pathname] ?? "OMenu Planner";
  // Per spec: Shopping page shows date range, Profile page does not
  const showDateRange = pathname === "/shopping";
  const subtitle = showDateRange && currentBook ? getWeekDateRange(currentBook.mealPlan.createdAt) : undefined;

  // Shopping page: Add button in header per spec
  if (pathname === "/shopping") {
    return (
      <header className="sticky top-0 z-40 bg-paper-base">
        <div className="px-5 pb-4 pt-14">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">{title}</p>
              {subtitle && <p className="mt-1 text-[11px] text-text-secondary">{subtitle}</p>}
            </div>
            {/* Add button per spec */}
            <button
              type="button"
              onClick={() => setShowAddItemModal(true)}
              aria-label="Add item"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card-base shadow-btn"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-paper-base">
      <div className="px-5 pb-4 pt-14">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">{title}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
