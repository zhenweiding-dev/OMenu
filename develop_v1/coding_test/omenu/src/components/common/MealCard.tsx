import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { DayMeals, MealType, Recipe } from '@/types';
import { MEAL_ICONS, MEAL_LABELS } from '@/utils/constants';

interface MealRowProps {
  mealType: MealType;
  recipe: Recipe | null;
  onClick?: () => void;
}

export function MealRow({ mealType, recipe, onClick }: MealRowProps) {
  const icon = MEAL_ICONS[mealType];

  if (!recipe) {
    return (
      <div className="flex items-center py-2.5">
        <div className="w-6 mr-2.5 text-base">{icon}</div>
        <div className="flex-1">
          <div className="text-body text-disabled-text">Not Planned</div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center py-2.5 w-full text-left hover:bg-paper-dark/50 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="w-6 mr-2.5 text-base">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-body text-primary-text truncate">{recipe.name}</div>
        <div className="text-caption text-secondary-text">
          {recipe.estimatedTime} min · {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
        </div>
      </div>
      <div className="text-body-sm text-secondary-text ml-2">{recipe.totalCalories} cal</div>
    </button>
  );
}

interface MealCardProps {
  day: string;
  date?: string;
  meals: DayMeals;
  onMealClick?: (meal: MealType, recipe: Recipe) => void;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function MealCard({
  day,
  date,
  meals,
  onMealClick,
  expanded = true,
  onToggle,
  className,
}: MealCardProps) {
  const handleMealClick = (mealType: MealType) => {
    const recipe = meals[mealType];
    if (recipe && onMealClick) {
      onMealClick(mealType, recipe);
    }
  };

  return (
    <div className={cn('bg-card rounded-card border border-divider p-4', className)}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full pb-3 border-b border-divider"
      >
        <div>
          <div className="text-h3 text-primary-text">{day}</div>
          {date && <div className="text-caption text-secondary-text mt-0.5">{date}</div>}
        </div>
        <ChevronRight
          className={cn(
            'w-[18px] h-[18px] text-disabled-text transition-transform',
            expanded && 'rotate-90'
          )}
          strokeWidth={1.8}
        />
      </button>

      {/* Meals */}
      {expanded && (
        <div className="pt-2 divide-y divide-divider">
          {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
            <MealRow
              key={mealType}
              mealType={mealType}
              recipe={meals[mealType]}
              onClick={() => handleMealClick(mealType)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TodayMealCardProps {
  day: string;
  date: string;
  meals: DayMeals;
  onMealClick?: (meal: MealType, recipe: Recipe) => void;
  onViewAll?: () => void;
  className?: string;
}

export function TodayMealCard({
  day,
  date,
  meals,
  onMealClick,
  onViewAll,
  className,
}: TodayMealCardProps) {
  const totalCalories =
    (meals.breakfast?.totalCalories || 0) +
    (meals.lunch?.totalCalories || 0) +
    (meals.dinner?.totalCalories || 0);

  return (
    <div className={cn('bg-card rounded-card border border-divider overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-divider">
        <div>
          <div className="text-h3 text-primary-text">{day}</div>
          <div className="text-caption text-secondary-text mt-0.5">{date}</div>
        </div>
        <div className="text-right">
          <div className="text-body-sm text-secondary-text">{totalCalories} cal</div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-body-sm text-accent font-medium mt-0.5"
            >
              View Week
            </button>
          )}
        </div>
      </div>

      {/* Meals */}
      <div className="p-4 divide-y divide-divider">
        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
          <MealRow
            key={mealType}
            mealType={mealType}
            recipe={meals[mealType]}
            onClick={() => {
              const recipe = meals[mealType];
              if (recipe && onMealClick) {
                onMealClick(mealType, recipe);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
