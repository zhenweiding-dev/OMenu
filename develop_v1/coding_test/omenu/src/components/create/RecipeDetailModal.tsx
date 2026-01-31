import { useState } from 'react';
import { X, Clock, Users, Flame, ChefHat, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { DAY_LABELS, MEAL_LABELS, DIFFICULTY_LABELS } from '@/utils/constants';
import { formatQuantity } from '@/utils/helpers';
import type { Recipe, DayOfWeek, MealType } from '@/types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  day?: DayOfWeek;
  meal?: MealType;
  onClose: () => void;
  onUpdate?: (recipe: Recipe) => void;
  onDelete?: () => void;
}

export function RecipeDetailModal({
  recipe,
  day,
  meal,
  onClose,
  onUpdate,
  onDelete,
}: RecipeDetailModalProps) {
  const [notes, setNotes] = useState(recipe.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isReadOnly = !onUpdate || !onDelete;

  const handleSaveNotes = () => {
    if (onUpdate) {
      onUpdate({
        ...recipe,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-paper rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-divider">
          <div className="flex-1 pr-4">
            {day && meal && (
              <p className="text-caption text-secondary-text mb-1">
                {DAY_LABELS[day]} {MEAL_LABELS[meal]}
              </p>
            )}
            <h2 className="text-h2 font-display font-semibold text-primary-text">
              {recipe.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-secondary-text hover:text-primary-text"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick stats */}
          <div className="flex items-center gap-4 px-4 py-3 bg-paper-dark border-b border-divider">
            <div className="flex items-center gap-1.5 text-secondary-text">
              <Clock size={16} />
              <span className="text-body-small">{recipe.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary-text">
              <Users size={16} />
              <span className="text-body-small">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary-text">
              <ChefHat size={16} />
              <span className="text-body-small">{DIFFICULTY_LABELS[recipe.difficulty]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary-text ml-auto">
              <Flame size={16} />
              <span className="text-body-small">{recipe.totalCalories} cal</span>
            </div>
          </div>

          {/* Ingredients */}
          <div className="p-4 border-b border-divider">
            <h3 className="text-body font-semibold text-primary-text mb-3">
              Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, index) => (
                <li
                  key={index}
                  className="flex items-baseline gap-2 text-body text-secondary-text"
                >
                  <span className="text-accent">•</span>
                  <span className="text-primary-text">{ing.name}</span>
                  {ing.quantity > 0 && (
                    <span className="text-disabled-text">
                    {formatQuantity(ing.quantity, ing.unit, ing.category)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="p-4 border-b border-divider">
            <h3 className="text-body font-semibold text-primary-text mb-3">
              Instructions
            </h3>
            <ol className="space-y-3">
              {recipe.instructions
                .split('\n')
                .filter((step) => step.trim())
                .map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-body text-secondary-text"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-body-small font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-primary-text">
                      {step.replace(/^\d+\.\s*/, '')}
                    </span>
                  </li>
                ))}
            </ol>
          </div>

          {/* Notes */}
          <div className="p-4">
            <h3 className="text-body font-semibold text-primary-text mb-3">
              Notes
            </h3>
            {isReadOnly ? (
              <p className="text-body text-secondary-text">
                {recipe.notes || 'No notes added'}
              </p>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full h-24 px-3 py-2 bg-paper-dark rounded-lg border border-divider text-body text-primary-text placeholder:text-disabled-text resize-none focus:outline-none focus:border-accent"
              />
            )}
          </div>
        </div>

        {/* Footer - only show in edit mode */}
        {!isReadOnly && (
          <div className="flex gap-3 p-4 border-t border-divider">
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Remove
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveNotes}
              disabled={notes === (recipe.notes || '')}
            >
              Save Notes
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal - only show in edit mode */}
      {!isReadOnly && showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-paper rounded-xl p-6 max-w-sm w-full animate-scale-in">
            <h3 className="text-h3 font-display font-semibold text-primary-text mb-2">
              Remove this meal?
            </h3>
            <p className="text-body text-secondary-text mb-6">
              This will remove "{recipe.name}" from your meal plan. You can regenerate it later.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={confirmDelete}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
