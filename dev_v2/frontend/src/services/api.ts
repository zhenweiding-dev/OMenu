import type { MealPlan, ShoppingList, UserPreferences } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const GENERATION_TIMEOUT = 120_000;

interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export class ApiTimeoutError extends Error {
  constructor() {
    super("Request timed out. Please try again.");
    this.name = "ApiTimeoutError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      code: "UNKNOWN_ERROR",
      message: response.statusText,
    }));
    throw new Error(error.message);
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
