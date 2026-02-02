import { ArrowLeft, LayoutGrid } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getRelativeWeekLabel, getWeekDateRange } from "@/utils/helpers";
import { useAppStore } from "@/stores/useAppStore";

const ROUTE_TITLES: Record<string, string> = {
  "/shopping": "Shopping List",
  "/my": "Profile",
};

export function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const toggleMenuView = useAppStore((state) => state.toggleMenuView);

  if (pathname === "/create") {
    return null;
  }

  if (pathname === "/") {
    if (!currentBook) {
      return (
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-paper-base/95 backdrop-blur">
          <div className="px-6 pb-4 pt-6">
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-base">Welcome</p>
              <h1 className="text-[24px] font-bold leading-tight text-text-primary">Plan your meals effortlessly</h1>
              <p className="text-[12px] text-text-secondary">Create your first weekly menu to get started.</p>
            </div>
          </div>
        </header>
      );
    }

    if (isMenuOpen) {
      const relativeWeekLabel = getRelativeWeekLabel(currentBook.mealPlan.createdAt);
      const currentWeekRange = getWeekDateRange(currentBook.mealPlan.createdAt);

      return (
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-paper-base/95 backdrop-blur">
          <div className="px-6 pb-4 pt-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-base">{relativeWeekLabel}</p>
                <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-text-primary">{currentWeekRange}</h1>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMenuView}
                aria-label="View all menus"
                className="h-11 w-11 rounded-full"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
      );
    }

    return (
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-paper-base/95 backdrop-blur">
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenuView}
                aria-label="Back to current menu"
                className="mt-1 rounded-full border border-border-subtle text-text-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-base">Menu Library</p>
                <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-text-primary">My Menus</h1>
              </div>
            </div>
            <span className="inline-block h-11 w-11" aria-hidden />
          </div>
        </div>
      </header>
    );
  }

  const title = ROUTE_TITLES[pathname] ?? "OMenu Planner";
  const subtitle = currentBook ? getWeekDateRange(currentBook.mealPlan.createdAt) : undefined;

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-paper-base/95 backdrop-blur">
      <div className="px-6 pb-4 pt-6">
        <div className="space-y-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-accent-base">{title}</p>
          {subtitle && <p className="text-[13px] text-text-secondary">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
