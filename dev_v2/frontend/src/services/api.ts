import type { MealPlan, ShoppingList, UserPreferences, UserState } from "@/types";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const GENERATION_TIMEOUT = 120_000;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildMockMealPlan(preferences: UserPreferences): MealPlan {
  const plan = clone(SAMPLE_MENU_BOOK.mealPlan);
  const now = new Date().toISOString();
  const suffix = now.replace(/[-:.TZ]/g, "");
  return {
    ...plan,
    id: `mock_plan_${suffix}`,
    createdAt: now,
    preferences,
  };
}

function buildMockShoppingList(mealPlanId: string, createdAt: string): ShoppingList {
  const list = clone(SAMPLE_MENU_BOOK.shoppingList);
  const suffix = createdAt.replace(/[-:.TZ]/g, "");
  return {
    ...list,
    id: `mock_list_${suffix}`,
    mealPlanId,
    createdAt,
  };
}

function toErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  if ("detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object" && "message" in detail && typeof detail.message === "string") {
      return detail.message;
    }
  }
  return fallback;
}

export class ApiTimeoutError extends Error {
  constructor() {
    super("Request timed out. Please try again.");
    this.name = "ApiTimeoutError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const fallback = response.statusText || "Request failed";
    const message = toErrorMessage(payload, fallback);
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiTimeoutError();
    }
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach backend at ${API_BASE_URL}. Check that the server is running and VITE_API_BASE_URL is correct.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse<{ status: string; version: string }>(response);
}

export async function generateMealPlan(preferences: UserPreferences) {
  if (USE_MOCK) {
    await delay(1200);
    return buildMockMealPlan(preferences);
  }
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/meal-plans/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<MealPlan>(response);
}

export async function modifyMealPlan(planId: string, modification: string, currentPlan: MealPlan) {
  if (USE_MOCK) {
    await delay(800);
    return { ...currentPlan };
  }
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/meal-plans/${planId}/modify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modification, currentPlan }),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<MealPlan>(response);
}

export async function generateShoppingList(mealPlanId: string, mealPlan: MealPlan) {
  if (USE_MOCK) {
    await delay(800);
    return buildMockShoppingList(mealPlanId, new Date().toISOString());
  }
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/shopping-lists/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealPlanId, mealPlan }),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<ShoppingList>(response);
}

export async function fetchUserState() {
  const response = await fetch(`${API_BASE_URL}/api/user-state`);
  return handleResponse<UserState>(response);
}

export async function saveUserState(state: UserState) {
  const response = await fetch(`${API_BASE_URL}/api/user-state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  return handleResponse<UserState>(response);
}
