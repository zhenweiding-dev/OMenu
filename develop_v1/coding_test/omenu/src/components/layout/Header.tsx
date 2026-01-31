import { ChevronLeft, Plus, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showAdd?: boolean;
  onAdd?: () => void;
  showViewToggle?: boolean;
  viewMode?: 'card' | 'list';
  onViewToggle?: () => void;
  className?: string;
  rightContent?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  onBack,
  showAdd = false,
  onAdd,
  showViewToggle = false,
  viewMode = 'card',
  onViewToggle,
  className,
  rightContent,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between px-5 pt-14 pb-4 bg-paper',
        className
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center -ml-2"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-primary-text" strokeWidth={1.8} />
          </button>
        )}
        <h1 className="text-h1 text-primary-text tracking-tight">{title}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {showViewToggle && (
          <button
            onClick={onViewToggle}
            className="w-9 h-9 flex items-center justify-center"
            aria-label={viewMode === 'card' ? 'Switch to list view' : 'Switch to card view'}
          >
            {viewMode === 'card' ? (
              <List className="w-[22px] h-[22px] text-primary-text" strokeWidth={1.8} />
            ) : (
              <LayoutGrid className="w-[22px] h-[22px] text-primary-text" strokeWidth={1.8} />
            )}
          </button>
        )}

        {showAdd && (
          <button
            onClick={onAdd}
            className="w-9 h-9 flex items-center justify-center"
            aria-label="Add new"
          >
            <Plus className="w-[22px] h-[22px] text-primary-text" strokeWidth={1.8} />
          </button>
        )}

        {rightContent}
      </div>
    </header>
  );
}
