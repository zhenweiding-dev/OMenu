import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full border-accent/30 border-t-accent animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-paper/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-body text-secondary-text">{message}</p>
      )}
    </div>
  );
}
