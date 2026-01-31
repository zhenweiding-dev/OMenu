import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { MealCard } from '@/components/common/MealCard';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/stores/useAppStore';
import type { DayOfWeek, MealType, Recipe, WeeklyMealPlan } from '@/types';
import { DAYS, DAY_LABELS } from '@/utils/constants';
import { formatDate, getWeekDates } from '@/utils/helpers';
import { RecipeDetailModal } from '@/components/create/RecipeDetailModal';

interface PlanCardProps {
  plan: WeeklyMealPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMealClick: (meal: MealType, recipe: Recipe) => void;
  onSetActive: () => void;
  isActive: boolean;
}

function PlanCard({
  plan,
  isExpanded,
  onToggle,
  onDelete,
  onMealClick,
  onSetActive,
  isActive,
}: PlanCardProps) {
  const weekStart = new Date(plan.weekStartDate);
  const weekDates = getWeekDates(weekStart);

  // Count total meals
  let mealCount = 0;
  DAYS.forEach((day) => {
    if (plan.days[day].breakfast) mealCount++;
    if (plan.days[day].lunch) mealCount++;
    if (plan.days[day].dinner) mealCount++;
  });

  // Preview text (first 3 meals)
  const previewMeals: string[] = [];
  for (const day of DAYS) {
    if (plan.days[day].breakfast) previewMeals.push(plan.days[day].breakfast!.name);
    if (plan.days[day].lunch) previewMeals.push(plan.days[day].lunch!.name);
    if (plan.days[day].dinner) previewMeals.push(plan.days[day].dinner!.name);
    if (previewMeals.length >= 3) break;
  }

  return (
    <div className="bg-card rounded-card border border-divider overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-h3 text-primary-text">
              Week of {formatDate(weekStart)}
            </span>
            {isActive && (
              <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-medium">
                ACTIVE
              </span>
            )}
          </div>
          <div className="text-body-sm text-secondary-text mt-1">
            {mealCount} meals planned
          </div>
          {!isExpanded && (
            <div className="text-caption text-disabled-text mt-1 truncate max-w-[250px]">
              {previewMeals.join(', ')}
            </div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-secondary-text transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-divider">
          <div className="p-4 space-y-3">
            {DAYS.map((day) => (
              <MealCard
                key={day}
                day={DAY_LABELS[day]}
                date={formatDate(weekDates[day])}
                meals={plan.days[day]}
                onMealClick={onMealClick}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 border-t border-divider">
            {!isActive && (
              <Button variant="secondary" onClick={onSetActive} fullWidth>
                Set as Active
              </Button>
            )}
            <Button
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-error"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlansPage() {
  const navigate = useNavigate();
  const { allPlans, currentPlanId, loadAllPlans, deletePlan, setCurrentPlanId } =
    useAppStore();

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadAllPlans();
  }, [loadAllPlans]);

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    setDeleteConfirmId(null);
  };

  const handleSetActive = (id: string) => {
    setCurrentPlanId(id);
  };

  return (
    <PageContainer showNav={false}>
      <Header title="Meal Plans" showBack onBack={() => navigate('/me')} />

      {allPlans.length === 0 ? (
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
          <h2 className="text-h2 text-primary-text mb-2">No plans yet</h2>
          <p className="text-body text-secondary-text mb-6">
            Create your first meal plan to get started
          </p>
          <Button onClick={() => navigate('/create')}>Create Meal Plan</Button>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-3 pb-8">
          {allPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isExpanded={expandedPlanId === plan.id}
              onToggle={() =>
                setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
              }
              onDelete={() => setDeleteConfirmId(plan.id)}
              onMealClick={(_meal, recipe) => setSelectedRecipe(recipe)}
              onSetActive={() => handleSetActive(plan.id)}
              isActive={currentPlanId === plan.id}
            />
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-card rounded-card p-5 max-w-sm w-full animate-scale-in">
            <h3 className="text-h3 text-primary-text mb-2">Delete Meal Plan?</h3>
            <p className="text-body text-secondary-text mb-6">
              This will also delete the associated shopping list. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmId(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirmId)}
                fullWidth
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
