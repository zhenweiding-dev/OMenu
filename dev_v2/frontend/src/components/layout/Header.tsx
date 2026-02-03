import { ArrowLeft } from "lucide-react";
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
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const toggleMenuView = useAppStore((state) => state.toggleMenuView);
  const setShowAddItemModal = useShoppingStore((state) => state.setShowAddItemModal);

  if (pathname === "/create") {
    return null;
  }

  if (pathname === "/") {
    if (!currentBook) {
      return (
        <header className="sticky top-0 z-40 bg-paper-base">
          <div className="px-5 pb-4 pt-14">
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">Welcome</p>
            </div>
          </div>
        </header>
      );
    }

    if (isMenuOpen) {
      const relativeWeekLabel = getRelativeWeekLabel(currentBook.mealPlan.createdAt);
      const currentWeekRange = getWeekDateRange(currentBook.mealPlan.createdAt);

      return (
        <header className="sticky top-0 z-40 bg-paper-base">
          <div className="px-5 pb-4 pt-14">
            <div className="flex items-start justify-between gap-6">
              <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">
                  {relativeWeekLabel}
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">{currentWeekRange}</p>
              </div>
              {/* Grid icon button */}
              <button
                type="button"
                onClick={toggleMenuView}
                aria-label="View all menus"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-base shadow-btn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        </header>
      );
    }

    // Menu closed view header
    return (
      <header className="sticky top-0 z-40 bg-paper-base">
        <div className="px-5 pb-4 pt-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMenuView}
              aria-label="Back to current menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-base shadow-btn"
            >
              <ArrowLeft className="h-5 w-5 text-text-primary" strokeWidth={2} />
            </button>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">MY MENUS</p>
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
