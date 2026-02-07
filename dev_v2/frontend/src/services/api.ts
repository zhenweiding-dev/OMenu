import { supabase } from "@/lib/supabase";
import type { MenuBook, ShoppingList, UserPreferences, WeekMenus } from "@/types";

const GENERATION_TIMEOUT = 180_000;

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

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
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
      throw new Error("Unable to reach the server. Please check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function generateMenuBook(preferences: UserPreferences) {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(
    "/api/generate-menu",
    {
      method: "POST",
      headers,
      body: JSON.stringify(preferences),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<MenuBook>(response);
}

export async function modifyMenuBook(bookId: string, modification: string, currentMenuBook: MenuBook) {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(
    "/api/modify-menu",
    {
      method: "POST",
      headers,
      body: JSON.stringify({ bookId, modification, currentMenuBook }),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<MenuBook>(response);
}

export async function generateShoppingList(menuBookId: string, menus: WeekMenus) {
  const headers = await getAuthHeaders();
  const response = await fetchWithTimeout(
    "/api/generate-shopping-list",
    {
      method: "POST",
      headers,
      body: JSON.stringify({ menuBookId, menus }),
    },
    GENERATION_TIMEOUT,
  );
  return handleResponse<ShoppingList>(response);
}
