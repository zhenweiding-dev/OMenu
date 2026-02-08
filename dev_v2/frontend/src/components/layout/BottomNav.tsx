import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

interface BottomNavProps {
  withinFrame?: boolean;
}

function PlanIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px] ui-icon-strong"
      fill="none"
      stroke="currentColor"
      data-active={isActive}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function ListIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px] ui-icon-strong"
      fill="none"
      stroke="currentColor"
      data-active={isActive}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

function MeIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px] ui-icon-strong"
      fill="none"
      stroke="currentColor"
      data-active={isActive}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navItems = [
  { to: "/", label: "MENU", Icon: PlanIcon },
  { to: "/shopping", label: "LIST", Icon: ListIcon },
  { to: "/me", label: "PROFILE", Icon: MeIcon },
];

export function BottomNav({ withinFrame = false }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "border-t border-border-subtle bg-card-base",
        withinFrame
          ? "fixed inset-x-0 bottom-0 z-50 lg:relative lg:z-10 lg:rounded-b-[1.75rem]"
          : "fixed inset-x-0 bottom-0 z-50",
      )}
    >
      <ul
        className={cn(
          "flex items-center justify-around",
          withinFrame ? "px-6 pb-7 pt-2 lg:px-5" : "px-6 pb-7 pt-2",
        )}
      >
        {navItems.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-5 py-2 transition-colors",
                  isActive ? "text-accent-base" : "text-text-disabled hover:text-text-secondary",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon isActive={isActive} />
                  <span className="ui-label-soft">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
