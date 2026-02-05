import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getRelativeWeekLabel, getWeekDateRange } from "@/utils/helpers";
import { useAppStore } from "@/stores/useAppStore";
import { useShoppingStore } from "@/stores/useShoppingStore";
import { Button } from "@/components/ui/button";

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
  const headerRef = useRef<HTMLElement | null>(null);
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const setIsMenuPickerOpen = useAppStore((state) => state.setIsMenuPickerOpen);
  const setShowAddItemModal = useShoppingStore((state) => state.setShowAddItemModal);

  useLayoutEffect(() => {
    if (pathname === "/create") return;
    const updateHeaderHeight = () => {
      const container = document.getElementById("phone-screen");
      if (!container || !headerRef.current) return;
      const height = Math.round(headerRef.current.getBoundingClientRect().height);
      container.style.setProperty("--header-height", `${height}px`);
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [pathname, currentBook]);

  if (pathname === "/create") {
    return null;
  }

  if (pathname === "/") {
    const relativeWeekLabel = currentBook ? getRelativeWeekLabel(currentBook.createdAt) : "WELCOME";
    const currentWeekRange = currentBook
      ? getWeekDateRange(currentBook.createdAt)
      : getWeekDateRange(new Date().toISOString());

    return (
      <header ref={headerRef} className="sticky top-0 z-40 bg-paper-base">
        <div className="px-5 pb-4 pt-14">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">
                {relativeWeekLabel}
              </p>
              {currentWeekRange && <p className="mt-1 text-[11px] text-text-secondary">{currentWeekRange}</p>}
            </div>
            <Button
              type="button"
              onClick={() => setIsMenuPickerOpen(true)}
              aria-label="Open menu book picker"
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-full px-4 text-[11px] uppercase tracking-[0.12em] shadow-btn"
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              MENUBOOK
            </Button>
          </div>
        </div>
      </header>
    );
  }

  const title = ROUTE_TITLES[pathname] ?? "OMenu Planner";
  // Per spec: Shopping page shows date range, Profile page does not
  const showDateRange = pathname === "/shopping";
  const subtitle = showDateRange && currentBook ? getWeekDateRange(currentBook.createdAt) : undefined;

  // Shopping page: Add button in header per spec
  if (pathname === "/shopping") {
    return (
      <header ref={headerRef} className="sticky top-0 z-40 bg-paper-base">
        <div className="px-5 pb-4 pt-14">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent-base">{title}</p>
              {subtitle && <p className="mt-1 text-[11px] text-text-secondary">{subtitle}</p>}
            </div>
            {/* Add button per spec */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowAddItemModal(true)}
              aria-label="Add item"
              className="h-9 w-9 rounded-xl border-dashed border-border-tag bg-white text-text-tertiary shadow-btn hover:border-accent-base"
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-paper-base">
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
