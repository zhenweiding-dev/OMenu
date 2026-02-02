import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { formatCurrency, formatIsoDate } from "@/utils/helpers";
import type { MenuBook, UserPreferences } from "@/types";
import { useShallow } from "zustand/react/shallow";

export function MyPage() {
  const navigate = useNavigate();
  const menuBooks = useAppStore((state) => state.menuBooks);
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());

  const draftPreferences = useDraftStore((state) => {
    const { keywords, mustHaveItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } = state;
    return { keywords, mustHaveItems, dislikedItems, numPeople, budget, difficulty, cookSchedule } satisfies UserPreferences;
  });

  const draftActions = useDraftStore(
    useShallow((state) => ({
      setStep: state.setStep,
      setKeywords: state.setKeywords,
      setMustHaveItems: state.setMustHaveItems,
      setDislikedItems: state.setDislikedItems,
      setNumPeople: state.setNumPeople,
      setBudget: state.setBudget,
      setDifficulty: state.setDifficulty,
      setCookSchedule: state.setCookSchedule,
    })),
  );

  const latestBook = useMemo<MenuBook | null>(() => {
    if (menuBooks.length === 0) return null;
    return [...menuBooks].sort((a, b) => (a.mealPlan.createdAt < b.mealPlan.createdAt ? 1 : -1))[0];
  }, [menuBooks]);

  const sourcePlan = latestBook ?? currentBook;
  const preferences: UserPreferences = sourcePlan?.mealPlan.preferences ?? draftPreferences;
  const lastGeneratedAt = sourcePlan?.mealPlan.createdAt ?? null;

  const tagStyles = "bg-paper-muted text-text-primary px-3 py-1 text-[12px] font-medium";

  const renderTags = (items: string[], placeholder: string) => {
    if (items.length === 0) {
      return <p className="text-sm text-text-secondary">{placeholder}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} className={tagStyles}>
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  const handleEditPreferences = () => {
    draftActions.setKeywords(preferences.keywords);
    draftActions.setMustHaveItems(preferences.mustHaveItems);
    draftActions.setDislikedItems(preferences.dislikedItems);
    draftActions.setNumPeople(preferences.numPeople);
    draftActions.setBudget(preferences.budget);
    draftActions.setDifficulty(preferences.difficulty);
    draftActions.setCookSchedule({ ...preferences.cookSchedule });
    draftActions.setStep(2);
    navigate("/create");
  };

  return (
    <PageContainer className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[16px]">Your Meal Preferences</CardTitle>
            <p className="text-[13px] text-text-secondary">
              Last updated {lastGeneratedAt ? formatIsoDate(lastGeneratedAt) : "using your current draft"}
            </p>
          </div>
          <Button onClick={handleEditPreferences} className="w-full sm:w-auto">
            Edit preferences
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Keywords</h3>
              {renderTags(preferences.keywords, "No keywords saved yet.")}
            </div>
            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Must-have items</h3>
              {renderTags(preferences.mustHaveItems, "No must-have items saved yet.")}
            </div>
            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Disliked items</h3>
              {renderTags(preferences.dislikedItems, "No dislikes added yet.")}
            </div>
            <div className="space-y-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Cooking schedule</h3>
              <p className="text-sm text-text-secondary">Customize which meals you cook on each day inside the edit flow.</p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-paper-muted p-4 text-center">
              <dt className="text-[12px] uppercase tracking-[0.18em] text-text-secondary">People</dt>
              <dd className="text-[18px] font-semibold text-text-primary">{preferences.numPeople}</dd>
            </div>
            <div className="rounded-2xl bg-paper-muted p-4 text-center">
              <dt className="text-[12px] uppercase tracking-[0.18em] text-text-secondary">Weekly Budget</dt>
              <dd className="text-[18px] font-semibold text-text-primary">{formatCurrency(preferences.budget)}</dd>
            </div>
            <div className="rounded-2xl bg-paper-muted p-4 text-center">
              <dt className="text-[12px] uppercase tracking-[0.18em] text-text-secondary">Difficulty</dt>
              <dd className="text-[18px] font-semibold text-text-primary">
                {preferences.difficulty.charAt(0).toUpperCase() + preferences.difficulty.slice(1)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
