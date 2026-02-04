/**
 * Stores index
 * Re-exports all Zustand stores for cleaner imports
 * 
 * Store Organization:
 * - useAppStore: Main application state (menuBooks, UI state) - persisted to localStorage & backend
 * - useDraftStore: In-progress meal plan creation - persisted to localStorage & backend
 * - useMenuExtrasStore: Additional meals added to menu books - synced to backend only
 * - useShoppingStore: Shopping page UI state - transient, not persisted
 */

export { useAppStore } from "./useAppStore";
export { useDraftStore } from "./useDraftStore";
export { useMenuExtrasStore } from "./useMenuExtrasStore";
export { useShoppingStore } from "./useShoppingStore";
