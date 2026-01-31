import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Custom SVG icons as per UI_DESIGN.md
const ForkKnifeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="7" y1="2" x2="7" y2="22" strokeLinecap="round" />
    <path d="M21 15V2a5 5 0 00-5 5v6h4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="18" y1="13" x2="18" y2="22" strokeLinecap="round" />
  </svg>
);

const ChecklistIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
    <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
    <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
    <polyline points="4 6 4.5 6.5 6 5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="4 12 4.5 12.5 6 11" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="4 18 4.5 18.5 6 17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Today',
    icon: <ForkKnifeIcon className="w-[22px] h-[22px]" />,
  },
  {
    path: '/shopping',
    label: 'List',
    icon: <ChecklistIcon className="w-[22px] h-[22px]" />,
  },
  {
    path: '/me',
    label: 'Me',
    icon: <HeartIcon className="w-[22px] h-[22px]" />,
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-divider px-4 pt-2 pb-safe-bottom z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 transition-colors',
                isActive ? 'text-accent' : 'text-disabled-text'
              )}
            >
              {item.icon}
              <span
                className={cn(
                  'text-nav-label',
                  isActive && 'font-medium'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
