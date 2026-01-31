import { Plus } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useState, useRef, useEffect } from 'react';

interface TagProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  emoji?: string;
  className?: string;
}

export function Tag({ children, selected = false, onClick, emoji, className }: TagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-tag text-tag transition-all',
        'border focus:outline-none focus:ring-2 focus:ring-accent/30',
        selected
          ? 'bg-tag-selected-bg border-tag-selected-border text-accent font-medium'
          : 'bg-transparent border-tag-border text-secondary-text hover:border-accent-light hover:text-primary-text',
        className
      )}
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      {children}
    </button>
  );
}

interface AddTagProps {
  onAdd: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function AddTag({ onAdd, placeholder = 'Add', maxLength = 20, className }: AddTagProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setValue('');
      setIsExpanded(false);
    }
  };

  const handleBlur = () => {
    if (!value.trim()) {
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-tag text-tag',
          'border border-dashed border-tag-border text-secondary-text',
          'hover:border-accent-light hover:text-primary-text transition-colors',
          className
        )}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        {placeholder}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-tag',
        'border border-accent bg-transparent',
        className
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type here..."
        className="w-24 bg-transparent border-none outline-none text-tag text-primary-text placeholder:text-disabled-text"
        maxLength={maxLength}
      />
      <span className="text-[10px] text-disabled-text">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

interface TagGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function TagGroup({ label, children, className }: TagGroupProps) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="text-section-label uppercase tracking-wider text-secondary-text mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
