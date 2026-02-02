import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <PageContainer className="space-y-6 py-6">
      <header className="space-y-1">
        <h1 className="text-[26px] font-semibold text-text-primary">Profile</h1>
        <p className="text-[13px] text-text-secondary">Adjust your defaults to keep future meal plans aligned with your goals.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-[16px]">Preferences</CardTitle>
            <p className="text-[13px] text-text-secondary">
              Last updated {lastGeneratedAt ? formatIsoDate(lastGeneratedAt) : "from your current draft"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter>
            <Button onClick={handleEditPreferences}>Edit preferences</Button>
          </CardFooter>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-[16px]">Defaults</CardTitle>
            <p className="text-[13px] text-text-secondary">These settings apply when generating a new plan.</p>
          </CardHeader>
          <CardContent>
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
      </section>
    </PageContainer>
  );
}
