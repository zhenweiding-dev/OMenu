import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { useAppStore } from '@/stores/useAppStore';
import { generateMealPlan } from '@/services/gemini';
import { generateId, getNextMonday } from '@/utils/helpers';
import type { WeeklyMealPlan } from '@/types';

interface StepLoadingProps {
  onComplete: () => void;
  onError: () => void;
  onGoHome: () => void;
}

const LOADING_MESSAGES = [
  'Analyzing your preferences...',
  'Finding delicious recipes...',
  'Balancing nutrition...',
  'Creating your perfect week...',
  'Almost there...',
];

export function StepLoading({ onComplete, onError, onGoHome }: StepLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toUserPreferences = useDraftStore((s) => s.toUserPreferences);
  const savePlan = useAppStore((s) => s.savePlan);
  const setCurrentPlanId = useAppStore((s) => s.setCurrentPlanId);

  // Rotate loading messages
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Generate meal plan
  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        const preferences = toUserPreferences();
        const response = await generateMealPlan(preferences);

        if (cancelled) return;

        // Create the meal plan object
        // Note: response IS the days object (WeekDays), not response.days
        const plan: WeeklyMealPlan = {
          id: generateId(),
          createdAt: new Date(),
          weekStartDate: getNextMonday(),
          status: 'ready',
          preferences,
          days: response,  // response is WeekDays directly
        };

        // Save to DB and set as current
        await savePlan(plan);
        setCurrentPlanId(plan.id);

        setIsGenerating(false);
        onComplete();
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to generate meal plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate meal plan');
        setIsGenerating(false);
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [toUserPreferences, savePlan, setCurrentPlanId, onComplete]);

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <span className="text-4xl">😕</span>
        </div>
        <h2 className="text-h2 font-display font-semibold text-primary-text text-center mb-2">
          Something went wrong
        </h2>
        <p className="text-body text-secondary-text text-center mb-8 max-w-xs">
          {error}
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <Button variant="secondary" className="flex-1" onClick={onGoHome}>
            Go Home
          </Button>
          <Button className="flex-1" onClick={onError}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      {/* Animated chef emoji */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
          <span className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>
            👨‍🍳
          </span>
        </div>
        {/* Floating food emojis */}
        <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <span className="text-2xl">🥗</span>
        </div>
        <div className="absolute -bottom-1 -left-3 animate-bounce" style={{ animationDelay: '1s' }}>
          <span className="text-2xl">🍳</span>
        </div>
        <div className="absolute top-0 -left-4 animate-bounce" style={{ animationDelay: '1.5s' }}>
          <span className="text-xl">🥕</span>
        </div>
      </div>

      {/* Loading text */}
      <h2 className="text-h2 font-display font-semibold text-primary-text text-center mb-2">
        Creating your meal plan
      </h2>
      <p className="text-body text-secondary-text text-center mb-8 h-6 transition-opacity duration-300">
        {LOADING_MESSAGES[messageIndex]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {/* Go home option */}
      <div className="absolute bottom-8 left-0 right-0 px-4">
        <Button variant="text" fullWidth onClick={onGoHome}>
          Go Home (plan will generate in background)
        </Button>
      </div>
    </div>
  );
}
