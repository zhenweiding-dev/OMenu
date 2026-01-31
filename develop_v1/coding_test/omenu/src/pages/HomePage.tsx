import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { MealCard, TodayMealCard } from '@/components/common/MealCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAppStore } from '@/stores/useAppStore';
import type { DayOfWeek, MealType, Recipe } from '@/types';
import { DAYS, DAY_LABELS } from '@/utils/constants';
import { getNextMonday, getWeekDates, formatDate } from '@/utils/helpers';
import { RecipeDetailModal } from '@/components/create/RecipeDetailModal';

export function HomePage() {
  const navigate = useNavigate();
  const {
    currentPlan,
    isGenerating,
    generationError,
    loadCurrentPlan,
    loadCurrentShoppingList,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedRecipe, setSelectedRecipe] = useState<{
    recipe: Recipe;
    day: DayOfWeek;
    meal: MealType;
  } | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(new Set(['monday']));
  
  const { savePlan } = useAppStore();

  useEffect(() => {
    loadCurrentPlan();
    loadCurrentShoppingList();
  }, [loadCurrentPlan, loadCurrentShoppingList]);

  const handleCreatePlan = () => {
    navigate('/create');
  };

  const handleMealClick = (day: DayOfWeek, meal: MealType, recipe: Recipe) => {
    setSelectedRecipe({ recipe, day, meal });
  };

  const handleToggleDay = (day: DayOfWeek) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleViewWeek = () => {
    setViewMode('list');
    setExpandedDays(new Set(DAYS));
  };

  // Get today's info
  const today = new Date();
  const dayIndex = today.getDay();
  const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDay = dayNames[dayIndex];

  // Get week dates
  const weekStart = currentPlan?.weekStartDate
    ? new Date(currentPlan.weekStartDate)
    : getNextMonday();
  const weekDates = getWeekDates(weekStart);

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-body text-secondary-text">
            Your meal plan is being generated...
          </p>
        </div>
      );
    }

    // Error state
    if (generationError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-h2 text-primary-text mb-2">Something went wrong</h2>
          <p className="text-body text-secondary-text mb-6">{generationError}</p>
          <Button onClick={handleCreatePlan}>Try Again</Button>
        </div>
      );
    }

    // Empty state
    if (!currentPlan || currentPlan.status !== 'ready' || !currentPlan.days) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-24 h-24 bg-paper-dark rounded-full flex items-center justify-center mb-6 border border-divider">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10 text-disabled-text"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="12" y2="12" />
              <line x1="7" y1="16" x2="15" y2="16" />
            </svg>
          </div>
          <h2 className="text-h2 text-primary-text mb-2">No meal plan yet</h2>
          <p className="text-body text-secondary-text mb-6">
            Create your first weekly meal plan
            <br />
            and let AI do the planning for you
          </p>
          <Button onClick={handleCreatePlan}>Create Meal Plan</Button>
        </div>
      );
    }

    // Ready state - show meal plan
    const { days } = currentPlan;

    // Card view - show today only
    if (viewMode === 'card') {
      const todayMeals = days[todayDay] || { breakfast: null, lunch: null, dinner: null };
      return (
        <div className="px-5 py-4">
          <TodayMealCard
            day={DAY_LABELS[todayDay]}
            date={formatDate(today)}
            meals={todayMeals}
            onMealClick={(meal, recipe) => handleMealClick(todayDay, meal, recipe)}
            onViewAll={handleViewWeek}
          />
        </div>
      );
    }

    // List view - show all days
    return (
      <div className="px-5 py-4 space-y-3">
        {DAYS.map((day) => (
          <MealCard
            key={day}
            day={DAY_LABELS[day]}
            date={formatDate(weekDates[day])}
            meals={days[day] || { breakfast: null, lunch: null, dinner: null }}
            expanded={expandedDays.has(day)}
            onToggle={() => handleToggleDay(day)}
            onMealClick={(meal, recipe) => handleMealClick(day, meal, recipe)}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer>
      <Header
        title="OMenu"
        showViewToggle={!!currentPlan && currentPlan.status === 'ready' && !!currentPlan.days}
        viewMode={viewMode}
        onViewToggle={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
        showAdd
        onAdd={handleCreatePlan}
      />
      {renderContent()}

      {/* Recipe Detail Modal */}
      {selectedRecipe && currentPlan && currentPlan.days && (
        <RecipeDetailModal
          recipe={selectedRecipe.recipe}
          day={selectedRecipe.day}
          meal={selectedRecipe.meal}
          onClose={() => setSelectedRecipe(null)}
          onUpdate={async (updatedRecipe) => {
            const updatedDays = { ...currentPlan.days };
            updatedDays[selectedRecipe.day] = {
              ...(updatedDays[selectedRecipe.day] || { breakfast: null, lunch: null, dinner: null }),
              [selectedRecipe.meal]: updatedRecipe,
            };
            await savePlan({ ...currentPlan, days: updatedDays });
            setSelectedRecipe(null);
          }}
          onDelete={async () => {
            const updatedDays = { ...currentPlan.days };
            updatedDays[selectedRecipe.day] = {
              ...(updatedDays[selectedRecipe.day] || { breakfast: null, lunch: null, dinner: null }),
              [selectedRecipe.meal]: null,
            };
            await savePlan({ ...currentPlan, days: updatedDays });
            setSelectedRecipe(null);
          }}
        />
      )}
    </PageContainer>
  );
}
