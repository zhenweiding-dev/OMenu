import { useEffect, useRef, useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/stores/useAppStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { useMenuExtrasStore } from "@/stores/useMenuExtrasStore";
import {
  fetchProfile,
  fetchMenuBooks,
  fetchUIState,
  fetchDraft,
  fetchMenuExtras,
  saveProfile,
  saveUIState,
  saveDraft,
  saveMenuExtras,
  createMenuBook as apiCreateMenuBook,
  updateMenuBook as apiUpdateMenuBook,
  deleteMenuBook as apiDeleteMenuBook,
} from "@/services/api";
import type { MenuBook, UserPreferences } from "@/types";

const SYNC_DEBOUNCE_MS = 600;

interface SyncRefs {
  profile: number | null;
  uiState: number | null;
  draft: number | null;
  extras: number | null;
  menuBooks: number | null;
  prevMenuBooks: MenuBook[];
}

interface UseBackendSyncReturn {
  isReady: boolean;
  syncProfile: () => void;
  syncUIState: () => void;
  syncDraft: () => void;
  syncMenuExtras: () => void;
  syncMenuBooks: () => void;
}

/**
 * Centralized hook for synchronizing frontend state with backend.
 * Handles loading initial data and debounced saving of changes.
 * All data comes from the backend - no localStorage persistence.
 */
export function useBackendSync(): UseBackendSyncReturn {
  const syncRefs = useRef<SyncRefs>({
    profile: null,
    uiState: null,
    draft: null,
    extras: null,
    menuBooks: null,
    prevMenuBooks: [],
  });

  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  // App store selectors
  const menuBooks = useAppStore((state) => state.menuBooks);
  const setMenuBooks = useAppStore((state) => state.setMenuBooks);
  const currentWeekId = useAppStore((state) => state.currentWeekId);
  const currentDayIndex = useAppStore((state) => state.currentDayIndex);
  const setCurrentDayIndex = useAppStore((state) => state.setCurrentDayIndex);
  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useAppStore((state) => state.setIsMenuOpen);

  // Menu extras store
  const menuExtras = useMenuExtrasStore((state) => state.extras);
  const setMenuExtras = useMenuExtrasStore((state) => state.setExtras);

  // Draft store selectors
  const setDraftPreferences = useDraftStore((state) => state.setPreferences);
  const setDraftState = useDraftStore((state) => state.setDraftState);

  const draftPreferences = useDraftStore(
    useShallow((state) => ({
      keywords: state.keywords,
      mustHaveItems: state.mustHaveItems,
      dislikedItems: state.dislikedItems,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
    }))
  );

  const draftState = useDraftStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      keywords: state.keywords,
      mustHaveItems: state.mustHaveItems,
      dislikedItems: state.dislikedItems,
      numPeople: state.numPeople,
      budget: state.budget,
      difficulty: state.difficulty,
      cookSchedule: state.cookSchedule,
      lastUpdated: state.lastUpdated,
      pendingResult: state.pendingResult,
    }))
  );

  // Cleanup helper
  const clearTimeout = (ref: keyof Omit<SyncRefs, "prevMenuBooks">) => {
    if (syncRefs.current[ref]) {
      window.clearTimeout(syncRefs.current[ref]!);
      syncRefs.current[ref] = null;
    }
  };

  // Load all data from backend on mount
  useEffect(() => {
    const loadRemoteState = async () => {
      try {
        const [profile, books, uiState, draft, extras] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchMenuBooks().catch(() => []),
          fetchUIState().catch(() => ({
            currentWeekId: null,
            currentDayIndex: 0,
            isMenuOpen: true,
          })),
          fetchDraft().catch(() => null),
          fetchMenuExtras().catch(() => ({})),
        ]);

        if (!mountedRef.current) return;

        // Set menu books and current week
        if (books.length > 0) {
          setMenuBooks(books, uiState.currentWeekId ?? books[0]?.id ?? null);
          syncRefs.current.prevMenuBooks = books;
        }

        // Set UI state
        if (typeof uiState.currentDayIndex === "number") {
          setCurrentDayIndex(uiState.currentDayIndex);
        }
        if (typeof uiState.isMenuOpen === "boolean") {
          setIsMenuOpen(uiState.isMenuOpen);
        }

        // Set profile/preferences
        if (profile) {
          setDraftPreferences(profile);
        }

        // Set menu extras
        if (extras && Object.keys(extras).length > 0) {
          setMenuExtras(extras);
        }

        // Set draft state
        if (draft) {
          setDraftState(draft);
        }
      } catch {
        // Ignore errors on initial load - backend may not be running
      } finally {
        if (mountedRef.current) {
          setIsReady(true);
        }
      }
    };

    loadRemoteState();

    return () => {
      mountedRef.current = false;
    };
  }, [
    setCurrentDayIndex,
    setDraftPreferences,
    setDraftState,
    setIsMenuOpen,
    setMenuBooks,
    setMenuExtras,
  ]);

  // Sync profile changes
  const syncProfile = useCallback(() => {
    if (!isReady) return;
    clearTimeout("profile");
    syncRefs.current.profile = window.setTimeout(() => {
      saveProfile(draftPreferences as UserPreferences).catch(() => {});
    }, SYNC_DEBOUNCE_MS);
  }, [draftPreferences, isReady]);

  useEffect(() => {
    if (!isReady) return;
    syncProfile();
    return () => clearTimeout("profile");
  }, [syncProfile, isReady]);

  // Sync UI state changes
  const syncUIState = useCallback(() => {
    if (!isReady) return;
    clearTimeout("uiState");
    syncRefs.current.uiState = window.setTimeout(() => {
      saveUIState({ currentWeekId, currentDayIndex, isMenuOpen }).catch(() => {});
    }, SYNC_DEBOUNCE_MS);
  }, [currentWeekId, currentDayIndex, isMenuOpen, isReady]);

  useEffect(() => {
    if (!isReady) return;
    syncUIState();
    return () => clearTimeout("uiState");
  }, [syncUIState, isReady]);

  // Sync draft state changes
  const syncDraft = useCallback(() => {
    if (!isReady) return;
    clearTimeout("draft");
    syncRefs.current.draft = window.setTimeout(() => {
      saveDraft(draftState).catch(() => {});
    }, SYNC_DEBOUNCE_MS);
  }, [draftState, isReady]);

  useEffect(() => {
    if (!isReady) return;
    syncDraft();
    return () => clearTimeout("draft");
  }, [syncDraft, isReady]);

  // Sync menu extras changes
  const syncMenuExtras = useCallback(() => {
    if (!isReady) return;
    clearTimeout("extras");
    syncRefs.current.extras = window.setTimeout(() => {
      saveMenuExtras(menuExtras).catch(() => {});
    }, SYNC_DEBOUNCE_MS);
  }, [menuExtras, isReady]);

  useEffect(() => {
    if (!isReady) return;
    syncMenuExtras();
    return () => clearTimeout("extras");
  }, [syncMenuExtras, isReady]);

  // Sync menu books changes (create/update/delete)
  const syncMenuBooks = useCallback(() => {
    if (!isReady) return;
    clearTimeout("menuBooks");

    syncRefs.current.menuBooks = window.setTimeout(() => {
      const prevBooks = syncRefs.current.prevMenuBooks;
      const prevIds = new Set(prevBooks.map((b) => b.id));
      const currentIds = new Set(menuBooks.map((b) => b.id));

      // Find new books (created)
      const newBooks = menuBooks.filter((b) => !prevIds.has(b.id));
      // Find removed books (deleted)
      const removedIds = [...prevIds].filter((id) => !currentIds.has(id));
      // Find updated books
      const updatedBooks = menuBooks.filter((b) => {
        if (!prevIds.has(b.id)) return false;
        const prev = prevBooks.find((p) => p.id === b.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(b);
      });

      // Perform API calls
      newBooks.forEach((book) => apiCreateMenuBook(book).catch(() => {}));
      removedIds.forEach((id) => apiDeleteMenuBook(id).catch(() => {}));
      updatedBooks.forEach((book) => apiUpdateMenuBook(book.id, book).catch(() => {}));

      // Update ref
      syncRefs.current.prevMenuBooks = menuBooks;
    }, SYNC_DEBOUNCE_MS);
  }, [menuBooks, isReady]);

  useEffect(() => {
    if (!isReady) return;
    syncMenuBooks();
    return () => clearTimeout("menuBooks");
  }, [syncMenuBooks, isReady]);

  return {
    isReady,
    syncProfile,
    syncUIState,
    syncDraft,
    syncMenuExtras,
    syncMenuBooks,
  };
}
