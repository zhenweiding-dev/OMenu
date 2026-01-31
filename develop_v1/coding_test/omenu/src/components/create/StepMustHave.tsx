import { ChevronLeft } from 'lucide-react';
import { Tag, AddTag, TagGroup } from '@/components/common/Tag';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { MUST_HAVE_BY_CATEGORY } from '@/utils/constants';

interface StepMustHaveProps {
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<keyof typeof MUST_HAVE_BY_CATEGORY, string> = {
  proteins: 'Proteins',
  grainsCarbs: 'Grains & Carbs',
  dairy: 'Dairy',
  vegetables: 'Vegetables',
  mealTypes: 'Meal Types',
  pantry: 'Pantry',
};

export function StepMustHave({ onNext, onBack }: StepMustHaveProps) {
  const mustHaveItems = useDraftStore((s) => s.mustHaveItems);
  const toggleMustHaveItem = useDraftStore((s) => s.toggleMustHaveItem);
  const setMustHaveItems = useDraftStore((s) => s.setMustHaveItems);

  const handleAddCustom = (item: string) => {
    if (!mustHaveItems.includes(item)) {
      setMustHaveItems([...mustHaveItems, item]);
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
                  step === 2 ? 'bg-accent' : 'bg-divider'
                }`}
              />
            ))}
          </div>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        <h1 className="text-h1 font-display font-semibold text-primary-text mb-1">
          Things you must have
        </h1>
        <p className="text-body text-secondary-text">
          Select ingredients or dishes you want to include
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {(Object.keys(MUST_HAVE_BY_CATEGORY) as (keyof typeof MUST_HAVE_BY_CATEGORY)[]).map(
          (category) => (
            <TagGroup key={category} label={CATEGORY_LABELS[category]}>
              {MUST_HAVE_BY_CATEGORY[category].map((item) => (
                <Tag
                  key={item.name}
                  emoji={item.emoji}
                  selected={mustHaveItems.includes(item.name)}
                  onClick={() => toggleMustHaveItem(item.name)}
                >
                  {item.name}
                </Tag>
              ))}
            </TagGroup>
          )
        )}

        {/* Custom items */}
        <TagGroup label="Custom">
          {mustHaveItems
            .filter(
              (item) =>
                !Object.values(MUST_HAVE_BY_CATEGORY)
                  .flat()
                  .some((i) => i.name === item)
            )
            .map((item) => (
              <Tag
                key={item}
                selected={true}
                onClick={() => toggleMustHaveItem(item)}
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
