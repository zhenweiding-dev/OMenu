import { cn } from '@/utils/helpers';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-accent text-white border-none hover:bg-accent-light focus:ring-accent active:scale-[0.98]',
    secondary:
      'bg-transparent text-primary-text border border-primary-text hover:bg-paper-dark focus:ring-accent active:scale-[0.98]',
    text: 'bg-transparent text-accent border-none hover:text-accent-light focus:ring-accent',
    danger:
      'bg-error text-white border-none hover:bg-error/90 focus:ring-error active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-body-sm rounded-button',
    md: 'px-7 py-3.5 text-body rounded-button',
    lg: 'px-8 py-4 text-body rounded-button',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
