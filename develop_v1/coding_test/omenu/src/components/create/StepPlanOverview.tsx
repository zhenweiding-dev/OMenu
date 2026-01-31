import { useState, useEffect } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { MealCard } from '@/components/common/MealCard';
import { Button } from '@/components/common/Button';
import { LoadingOverlay, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { RecipeDetailModal } from './RecipeDetailModal';
import { useAppStore } from '@/stores/useAppStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { modifyMealPlan, generateShoppingList } from '@/services/gemini';
import { generateId, getWeekDates, formatDate } from '@/utils/helpers';
import { DAYS, DAY_LABELS } from '@/utils/constants';
import type { DayOfWeek, MealType, Recipe, ShoppingList } from '@/types';

interface StepPlanOverviewProps {
  onComplete: () => void;
  onBack: () => void;
}

export function StepPlanOverview({ onComplete, onBack }: StepPlanOverviewProps) {
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>('monday');
  const [selectedRecipe, setSelectedRecipe] = useState<{
    recipe: Recipe;
    day: DayOfWeek;
    meal: MealType;
  } | null>(null);
  const [modifyInput, setModifyInput] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentPlan = useAppStore((s) => s.currentPlan);
  const loadCurrentPlan = useAppStore((s) => s.loadCurrentPlan);
  const savePlan = useAppStore((s) => s.savePlan);
  const saveShoppingList = useAppStore((s) => s.saveShoppingList);
  const clearStorage = useDraftStore((s) => s.clearStorage);

  // Load current plan on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadCurrentPlan();
      setIsLoading(false);
    };
    load();
  }, [loadCurrentPlan]);

  // Show loading while fetching plan
  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-body text-secondary-text">Loading meal plan...</p>
      </div>
    );
  }

  // Check if plan exists and has valid structure
  if (!currentPlan || !currentPlan.days) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <span className="text-4xl">😕</span>
        </div>
        <h2 className="text-h2 font-display font-semibold text-primary-text text-center mb-2">
          No meal plan found
        </h2>
        <p className="text-body text-secondary-text text-center mb-8 max-w-xs">
          Something went wrong loading your meal plan. Please try again.
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const weekDates = getWeekDates(new Date(currentPlan.weekStartDate));

  const handleMealClick = (day: DayOfWeek, meal: MealType) => {
    const recipe = currentPlan.days[day]?.[meal];
    if (recipe) {
      setSelectedRecipe({ recipe, day, meal });
    }
  };

  const handleModify = async () => {
    if (!currentPlan?.days || !modifyInput.trim()) return;

    setIsModifying(true);
    try {
      const response = await modifyMealPlan(
        modifyInput.trim(),
        currentPlan.preferences,
        currentPlan.days
      );

      const updatedPlan = {
        ...currentPlan,
        days: response,
      };

      await savePlan(updatedPlan);
      setModifyInput('');
    } catch (err) {
      console.error('Failed to modify plan:', err);
      alert('Failed to modify plan. Please try again.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!currentPlan?.days) return;

    setIsGeneratingList(true);
    try {
      const response = await generateShoppingList(currentPlan.days);

      const shoppingList: ShoppingList = {
        id: generateId(),
        mealPlanId: currentPlan.id,
        items: response.items.map((item, index) => ({
          ...item,
          id: `item-${index}-${Date.now()}`,
          purchased: false,
        })),
        createdAt: new Date(),
      };

      await saveShoppingList(shoppingList);
      clearStorage();
      onComplete();
    } catch (err) {
      console.error('Failed to generate shopping list:', err);
      alert('Failed to generate shopping list. Please try again.');
    } finally {
      setIsGeneratingList(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {isModifying && <LoadingOverlay message="Modifying your plan..." />}
      {isGeneratingList && <LoadingOverlay message="Creating shopping list..." />}

      {/* Header */}
      <div className="pt-14 px-4 pb-4 border-b border-divider">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-secondary-text hover:text-primary-text"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-h1 font-display font-semibold text-primary-text">
            Your Meal Plan
          </h1>
        </div>
        <p className="text-body text-secondary-text pl-8">
          Week of {formatDate(new Date(currentPlan.weekStartDate))}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-48">
        {DAYS.map((day) => {
          const dayMeals = currentPlan.days[day];
          if (!dayMeals) return null;
          
          const date = weekDates[day];

          return (
            <MealCard
              key={day}
              day={DAY_LABELS[day]}
              date={formatDate(date)}
              meals={dayMeals}
              expanded={expandedDay === day}
              onToggle={() =>
                setExpandedDay(expandedDay === day ? null : day)
              }
              onMealClick={(meal) => handleMealClick(day, meal)}
            />
          );
        })}
      </div>

      {/* Footer - Modify input + Generate button */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-divider px-4 py-4 safe-bottom">
        {/* Modify input */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={modifyInput}
              onChange={(e) => setModifyInput(e.target.value.slice(0, 200))}
              placeholder="Chat to modify (e.g., 'swap Monday dinner')"
              className="w-full px-4 py-3 pr-12 bg-paper-dark rounded-lg border border-divider text-body text-primary-text placeholder:text-disabled-text focus:outline-none focus:border-accent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleModify();
                }
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-disabled-text">
              {modifyInput.length}/200
            </span>
          </div>
          <button
            onClick={handleModify}
            disabled={!modifyInput.trim() || isModifying}
            className="px-4 py-3 bg-accent text-white rounded-lg disabled:opacity-50 hover:bg-accent-light transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Generate shopping list button */}
        <Button
          fullWidth
          onClick={handleGenerateShoppingList}
          loading={isGeneratingList}
        >
          Generate Shopping List
        </Button>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && currentPlan.days && (
        <RecipeDetailModal
          recipe={selectedRecipe.recipe}
          day={selectedRecipe.day}
          meal={selectedRecipe.meal}
          onClose={() => setSelectedRecipe(null)}
          onUpdate={async (updatedRecipe) => {
            const updatedDays = { ...currentPlan.days };
            updatedDays[selectedRecipe.day] = {
              ...updatedDays[selectedRecipe.day],
              [selectedRecipe.meal]: updatedRecipe,
            };

            await savePlan({
              ...currentPlan,
              days: updatedDays,
            });

            setSelectedRecipe(null);
          }}
          onDelete={async () => {
            const updatedDays = { ...currentPlan.days };
            updatedDays[selectedRecipe.day] = {
              ...updatedDays[selectedRecipe.day],
              [selectedRecipe.meal]: null,
            };

            await savePlan({
              ...currentPlan,
              days: updatedDays,
            });

            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}
