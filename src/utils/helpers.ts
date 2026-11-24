import { addDays, differenceInCalendarWeeks, format, startOfWeek } from "date-fns";
import type { MenuBook } from "@/types";

const MICROSECONDS_REGEX = /\.(\d{3})\d+(?=Z|[+-]\d{2}:\d{2}$)/;

function sanitizeIsoString(isoDate: string) {
  if (!isoDate) return isoDate;
  return isoDate.replace(MICROSECONDS_REGEX, ".$1");
}

// Every createdAt is a full timestamp (UTC or with offset), so parsing it gives
// the right local date as is.
function normalizeIsoToLocalDate(isoDate: string) {
  const date = new Date(sanitizeIsoString(isoDate));
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
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

/** Text for a failed generation, with the server's reason when there is one. */
export function failureMessage(errorMessage?: string | null) {
  return errorMessage
    ? `We couldn't finish this time: ${errorMessage}`
    : "We couldn't finish this time. Please try again.";
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

/**
 * Runs at most one task per key at a time. A task queued while one is running
 * replaces any earlier queued task for that key, so writes for one menu book reach
 * Supabase in order and only the latest version is sent after a slow request.
 * A failed task is not retried; the next change to the same book sends it again.
 */
export function createLatestTaskQueue(onError: (error: unknown) => void) {
  const running = new Set<string>();
  const queued = new Map<string, () => Promise<unknown>>();
  const run = (key: string, task: () => Promise<unknown>) => {
    if (running.has(key)) {
      queued.set(key, task);
      return;
    }
    running.add(key);
    task()
      .catch(onError)
      .finally(() => {
        running.delete(key);
        const next = queued.get(key);
        if (next) {
          queued.delete(key);
          run(key, next);
        }
      });
  };
  return run;
}

/**
 * Books to save and ids to delete between two store snapshots. Store updates
 * replace a book object whenever anything in it changes, so comparing object
 * references finds exactly the changed books.
 */
export function diffMenuBooks(prev: MenuBook[], next: MenuBook[]) {
  const prevById = new Map(prev.map((book) => [book.id, book]));
  const nextIds = new Set(next.map((book) => book.id));
  return {
    upserts: next.filter((book) => prevById.get(book.id) !== book),
    deletes: prev.filter((book) => !nextIds.has(book.id)).map((book) => book.id),
  };
}
