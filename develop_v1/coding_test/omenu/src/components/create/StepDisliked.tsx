import { ChevronLeft } from 'lucide-react';
import { Tag, AddTag, TagGroup } from '@/components/common/Tag';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { DISLIKED_BY_CATEGORY } from '@/utils/constants';

interface StepDislikedProps {
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<keyof typeof DISLIKED_BY_CATEGORY, string> = {
  allergens: 'Allergens',
  seafood: 'Seafood',
  vegetables: 'Vegetables',
  meats: 'Meats',
  flavorsTextures: 'Flavors & Textures',
  cookingStyles: 'Cooking Styles',
  other: 'Other',
};

export function StepDisliked({ onNext, onBack }: StepDislikedProps) {
  const dislikedItems = useDraftStore((s) => s.dislikedItems);
  const toggleDislikedItem = useDraftStore((s) => s.toggleDislikedItem);
  const setDislikedItems = useDraftStore((s) => s.setDislikedItems);

  const handleAddCustom = (item: string) => {
    if (!dislikedItems.includes(item)) {
      setDislikedItems([...dislikedItems, item]);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="pt-14 px-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-secondary-text hover:text-primary-text"
          >
            <ChevronLeft size={24} />
          </button>
          {/* Progress dots */}
          <div className="flex-1 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step === 3 ? 'bg-accent' : 'bg-divider'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <h1 className="text-h1 font-display font-semibold text-primary-text mb-1">
          Things to avoid
        </h1>
        <p className="text-body text-secondary-text">
          Select allergies, dislikes, or restrictions
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {(Object.keys(DISLIKED_BY_CATEGORY) as (keyof typeof DISLIKED_BY_CATEGORY)[]).map(
          (category) => (
            <TagGroup key={category} label={CATEGORY_LABELS[category]}>
              {DISLIKED_BY_CATEGORY[category].map((item) => (
                <Tag
                  key={item.name}
                  emoji={item.emoji}
                  selected={dislikedItems.includes(item.name)}
                  onClick={() => toggleDislikedItem(item.name)}
                >
                  {item.name}
                </Tag>
              ))}
            </TagGroup>
          )
        )}

        {/* Custom items */}
        <TagGroup label="Custom">
          {dislikedItems
            .filter(
              (item) =>
                !Object.values(DISLIKED_BY_CATEGORY)
                  .flat()
                  .some((i) => i.name === item)
            )
            .map((item) => (
              <Tag
                key={item}
                selected={true}
                onClick={() => toggleDislikedItem(item)}
              >
                {item}
              </Tag>
            ))}
          <AddTag onAdd={handleAddCustom} placeholder="Add item..." />
        </TagGroup>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-divider px-4 py-4 safe-bottom">
        <Button fullWidth onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
