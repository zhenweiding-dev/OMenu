import { afterEach, describe, expect, it } from "vitest";
import { diffMenuBooks, getWeekDateRange } from "@/utils/helpers";
import type { MenuBook } from "@/types";

const book = (id: string): MenuBook => ({
  id,
  createdAt: "2026-11-30T08:00:00.000Z",
  status: "ready",
  preferences: {
    specificPreferences: [],
    specificDisliked: [],
    numPeople: 2,
    budget: 120,
    difficulty: "easy",
    cookSchedule: {} as MenuBook["preferences"]["cookSchedule"],
  },
  menus: {} as MenuBook["menus"],
  shoppingList: { id: `sl_${id}`, menuBookId: id, createdAt: "", items: [] },
});

describe("diffMenuBooks", () => {
  it("returns only books whose object changed, plus removed ids", () => {
    const a = book("a");
    const b = book("b");
    const c = book("c");
    const changedB = { ...b, status: "ready" as const };
    const d = book("d");

    expect(diffMenuBooks([a, b, c], [a, changedB, d])).toEqual({
      upserts: [changedB, d],
      deletes: ["c"],
    });
  });

  it("returns nothing when the list is the same", () => {
    const books = [book("a"), book("b")];
    expect(diffMenuBooks(books, [...books])).toEqual({ upserts: [], deletes: [] });
  });
});

describe("getWeekDateRange", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  // Next Monday 00:00 local time, stored as UTC, must stay in its own week everywhere.
  it.each([
    ["America/Los_Angeles", "2026-11-30T08:00:00.000Z"],
    ["Europe/Berlin", "2026-11-29T23:00:00.000Z"],
    ["Asia/Shanghai", "2026-11-29T16:00:00.000Z"],
  ])("shows the stored week in %s", (tz, storedMonday) => {
    process.env.TZ = tz;
    expect(getWeekDateRange(storedMonday)).toBe("Nov 30 – Dec 6");
  });
});
