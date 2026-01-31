import { ChevronLeft } from 'lucide-react';
import { Tag, AddTag, TagGroup } from '@/components/common/Tag';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { KEYWORDS_BY_CATEGORY } from '@/utils/constants';

interface StepKeywordsProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepKeywords({ onNext, onBack }: StepKeywordsProps) {
  const { keywords, toggleKeyword } = useDraftStore();

  const handleAddCustom = (value: string) => {
    if (!keywords.includes(value)) {
      toggleKeyword(value);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step < 2
                  ? 'bg-accent'
                  : step === 2
                  ? 'bg-accent'
                  : 'bg-disabled-text/30'
              }`}
            />
          ))}
        </div>

        {/* Back button and title */}
        <button onClick={onBack} className="mb-4 -ml-1">
          <ChevronLeft className="w-6 h-6 text-primary-text" strokeWidth={1.8} />
        </button>

        <h1 className="text-h2 text-primary-text mb-1">
          Choose some keywords for your meal plan
        </h1>
        <p className="text-body text-secondary-text">Select all that apply</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <TagGroup label="Cooking Style">
          {KEYWORDS_BY_CATEGORY.cookingStyle.map((keyword) => (
            <Tag
              key={keyword}
              selected={keywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Tag>
          ))}
        </TagGroup>

        <TagGroup label="Diet & Health">
          {KEYWORDS_BY_CATEGORY.dietHealth.map((keyword) => (
            <Tag
              key={keyword}
              selected={keywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Tag>
          ))}
        </TagGroup>

        <TagGroup label="Cuisine">
          {KEYWORDS_BY_CATEGORY.cuisine.map((keyword) => (
            <Tag
              key={keyword}
              selected={keywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Tag>
          ))}
        </TagGroup>

        <TagGroup label="Other">
          {KEYWORDS_BY_CATEGORY.other.map((keyword) => (
            <Tag
              key={keyword}
              selected={keywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Tag>
          ))}
          {/* Custom keywords */}
          {keywords
            .filter(
              (k) =>
                !KEYWORDS_BY_CATEGORY.cookingStyle.includes(k) &&
                !KEYWORDS_BY_CATEGORY.dietHealth.includes(k) &&
                !KEYWORDS_BY_CATEGORY.cuisine.includes(k) &&
                !KEYWORDS_BY_CATEGORY.other.includes(k)
            )
            .map((keyword) => (
              <Tag
                key={keyword}
                selected
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </Tag>
            ))}
          <AddTag onAdd={handleAddCustom} placeholder="Add" />
        </TagGroup>
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-divider p-5">
        <Button onClick={onNext} fullWidth>
          Next
        </Button>
      </div>
    </div>
  );
}
