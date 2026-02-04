/**
 * Services index
 * Re-exports all API services for cleaner imports
 * 
 * API Service Organization:
 * - Health check: healthCheck()
 * - AI Generation: generateMealPlan(), modifyMealPlan(), generateShoppingList()
 * - Profile: fetchProfile(), saveProfile()
 * - Menu Books: fetchMenuBooks(), fetchMenuBook(), createMenuBook(), updateMenuBook(), deleteMenuBook()
 * - UI State: fetchUIState(), saveUIState()
 * - Draft: fetchDraft(), saveDraft(), clearDraft()
 * - Menu Extras: fetchMenuExtras(), saveMenuExtras()
 */

export {
  // Error classes
  ApiTimeoutError,
  
  // Health check
  healthCheck,
  
  // AI Generation
  generateMealPlan,
  modifyMealPlan,
  generateShoppingList,
  
  // Profile
  fetchProfile,
  saveProfile,
  
  // Menu Books
  fetchMenuBooks,
  fetchMenuBook,
  createMenuBook,
  updateMenuBook,
  deleteMenuBook,
  updateMenuBookShoppingList,
  
  // UI State
  fetchUIState,
  saveUIState,
  
  // Draft
  fetchDraft,
  saveDraft,
  clearDraft,
  
  // Menu Extras
  fetchMenuExtras,
  saveMenuExtras,
} from "./api";
