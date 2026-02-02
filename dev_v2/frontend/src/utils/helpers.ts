import { addDays, addMinutes, differenceInCalendarWeeks, format, isSameWeek, startOfWeek } from "date-fns";

function normalizeIsoToLocalDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return date;
  }
  return addMinutes(date, date.getTimezoneOffset());
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatIsoDate(isoDate: string) {
  return format(normalizeIsoToLocalDate(isoDate), "MMM d, yyyy");
}

export function getWeekDateRange(isoDate: string) {
  const start = startOfWeek(normalizeIsoToLocalDate(isoDate), { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}

export function getDayDisplay(isoDate: string, dayIndex: number) {
  const start = startOfWeek(normalizeIsoToLocalDate(isoDate), { weekStartsOn: 1 });
  const currentDate = addDays(start, dayIndex);
  return {
    dateLabel: format(currentDate, "MMM d"),
    iso: currentDate.toISOString(),
  };
}

export function startCaseDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function getRelativeWeekLabel(isoDate: string) {
  const targetStart = startOfWeek(normalizeIsoToLocalDate(isoDate), { weekStartsOn: 1 });
  const currentStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const diff = differenceInCalendarWeeks(targetStart, currentStart, {
    weekStartsOn: 1,
  });

  if (diff === 0) return "THIS WEEK";
  if (diff === -1) return "LAST WEEK";
  if (diff === 1) return "NEXT WEEK";

  const absDiff = Math.abs(diff);
  const unit = absDiff === 1 ? "WEEK" : "WEEKS";
  if (diff > 1) {
    return `IN ${absDiff} ${unit}`;
  }
  return `${absDiff} ${unit} AGO`;
}

export function isCurrentCalendarWeek(isoDate: string) {
  return isSameWeek(normalizeIsoToLocalDate(isoDate), new Date(), { weekStartsOn: 1 });
}
