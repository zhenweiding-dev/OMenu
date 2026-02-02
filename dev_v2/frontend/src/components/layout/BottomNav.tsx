import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

interface BottomNavProps {
  withinFrame?: boolean;
}

function PlanIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={isActive ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function ListIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={isActive ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function MeIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={isActive ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 10-16 0" />
    </svg>
  );
}

const navItems = [
  { to: "/", label: "Plan", Icon: PlanIcon },
  { to: "/shopping", label: "List", Icon: ListIcon },
  { to: "/me", label: "Me", Icon: MeIcon },
];

export function BottomNav({ withinFrame = false }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "border-t border-border-subtle bg-card-base",
        withinFrame
          ? "relative z-10 rounded-b-[1.75rem]"
          : "fixed inset-x-0 bottom-0 z-50",
      )}
    >
      <ul
        className={cn(
          "flex items-center justify-around",
          withinFrame ? "px-5 pb-7 pt-2" : "px-6 pb-7 pt-2",
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
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
