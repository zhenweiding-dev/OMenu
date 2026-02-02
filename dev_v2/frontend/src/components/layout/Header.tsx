import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getWeekDateRange } from "@/utils/helpers";
import { useAppStore } from "@/stores/useAppStore";

export function Header() {
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const location = useLocation();
  const showCreateCTA = location.pathname !== "/create";

  const subtitle = currentBook ? getWeekDateRange(currentBook.mealPlan.createdAt) : "Plan your meals effortlessly";

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-paper-base/95 backdrop-blur">
      <div className="px-6 pb-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <Link to="/" className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-base">This Week</p>
            <h1 className="text-[24px] font-bold leading-tight text-text-primary">OMenu Planner</h1>
            <p className="text-[12px] text-text-secondary">{subtitle}</p>
          </Link>
          {showCreateCTA && (
            <Button asChild size="sm" className="rounded-lg px-3 py-2 text-xs">
              <Link to="/create">New Plan</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
