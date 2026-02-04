import type { 
  DraftState,
  MealPlan, 
  MenuBook,
  MenuExtras,
  ShoppingList, 
  UIState,
  UserPreferences,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const GENERATION_TIMEOUT = 120_000;

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

// ========== Health Check ==========

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse<{ status: string; version: string }>(response);
}

// ========== AI Generation Endpoints ==========

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

// ========== Profile (User Preferences) ==========

export async function fetchProfile(): Promise<UserPreferences | null> {
  const response = await fetch(`${API_BASE_URL}/api/profile`);
  return handleResponse<UserPreferences | null>(response);
}

export async function saveProfile(profile: UserPreferences): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return handleResponse<UserPreferences>(response);
}

// ========== Menu Books ==========

export async function fetchMenuBooks(): Promise<MenuBook[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu-books`);
  return handleResponse<MenuBook[]>(response);
}

export async function fetchMenuBook(bookId: string): Promise<MenuBook> {
  const response = await fetch(`${API_BASE_URL}/api/menu-books/${bookId}`);
  return handleResponse<MenuBook>(response);
}

export async function createMenuBook(book: MenuBook): Promise<MenuBook> {
  const response = await fetch(`${API_BASE_URL}/api/menu-books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return handleResponse<MenuBook>(response);
}

export async function updateMenuBook(bookId: string, book: MenuBook): Promise<MenuBook> {
  const response = await fetch(`${API_BASE_URL}/api/menu-books/${bookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  return handleResponse<MenuBook>(response);
}

export async function deleteMenuBook(bookId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/menu-books/${bookId}`, {
    method: "DELETE",
  });
}

export async function updateMenuBookShoppingList(bookId: string, shoppingList: ShoppingList): Promise<MenuBook> {
  const response = await fetch(`${API_BASE_URL}/api/menu-books/${bookId}/shopping-list`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shoppingList),
  });
  return handleResponse<MenuBook>(response);
}

// ========== UI State ==========

export async function fetchUIState(): Promise<UIState> {
  const response = await fetch(`${API_BASE_URL}/api/ui-state`);
  return handleResponse<UIState>(response);
}

export async function saveUIState(state: UIState): Promise<UIState> {
  const response = await fetch(`${API_BASE_URL}/api/ui-state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  return handleResponse<UIState>(response);
}

// ========== Draft State ==========

export async function fetchDraft(): Promise<DraftState | null> {
  const response = await fetch(`${API_BASE_URL}/api/draft`);
  return handleResponse<DraftState | null>(response);
}

export async function saveDraft(draft: DraftState): Promise<DraftState> {
  const response = await fetch(`${API_BASE_URL}/api/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  return handleResponse<DraftState>(response);
}

export async function clearDraft(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/draft`, {
    method: "DELETE",
  });
}

// ========== Menu Extras ==========

export async function fetchMenuExtras(): Promise<MenuExtras> {
  const response = await fetch(`${API_BASE_URL}/api/menu-extras`);
  const data = await handleResponse<{ extras: MenuExtras }>(response);
  return data.extras;
}

export async function saveMenuExtras(extras: MenuExtras): Promise<MenuExtras> {
  const response = await fetch(`${API_BASE_URL}/api/menu-extras`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extras }),
  });
  const data = await handleResponse<{ extras: MenuExtras }>(response);
  return data.extras;
}
