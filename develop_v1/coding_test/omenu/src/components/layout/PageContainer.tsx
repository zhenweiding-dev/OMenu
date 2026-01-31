import { cn } from '@/utils/helpers';
import { BottomNav } from './BottomNav';

interface PageContainerProps {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
  contentClassName?: string;
}

export function PageContainer({
  children,
  showNav = true,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn('min-h-screen bg-paper flex flex-col', className)}>
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          showNav && 'pb-24', // Space for bottom nav
          contentClassName
        )}
      >
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
