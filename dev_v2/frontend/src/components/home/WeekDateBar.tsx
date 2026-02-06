import { addDays, format, startOfWeek } from "date-fns";
import { WEEK_DAYS } from "@/utils/constants";
import { cn } from "@/utils/cn";

interface WeekDateBarProps {
  createdAt: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}

const DAY_LABELS: Record<(typeof WEEK_DAYS)[number], string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function WeekDateBar({ createdAt, activeIndex, onSelect }: WeekDateBarProps) {
  const weekStart = startOfWeek(new Date(createdAt), { weekStartsOn: 1 });

  return (
    <div className="flex items-end justify-between gap-1 px-1">
      {WEEK_DAYS.map((day, index) => {
        const isActive = index === activeIndex;
        const dateLabel = format(addDays(weekStart, index), "MMM d");
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "group flex flex-1 flex-col items-center gap-1 rounded-full px-1 pt-2 pb-3 transition-colors",
              isActive
                ? "bg-accent-soft text-accent-base"
                : "bg-paper-muted/70 text-text-secondary hover:bg-paper-muted",
            )}
          >
            <span className="ui-label-soft normal-case">{DAY_LABELS[day]}</span>
            <span
              className={cn(
                "whitespace-nowrap ui-caption-soft",
                isActive ? "text-accent-base/80" : "text-text-tertiary",
              )}
            >
              {dateLabel}
            </span>
            <span
              className={cn(
                "mt-1 h-[3px] w-6 rounded-full transition-colors",
                isActive ? "bg-accent-base" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
