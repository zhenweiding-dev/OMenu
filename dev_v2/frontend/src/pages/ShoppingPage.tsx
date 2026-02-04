import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useShoppingStore } from "@/stores/useShoppingStore";
import { useMealPlan } from "@/hooks/useMealPlan";
import { INGREDIENT_CATEGORIES } from "@/utils/constants";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { IngredientCategory, ShoppingItem } from "@/types";
import { cn } from "@/utils/cn";

const CATEGORY_DETAILS: Record<IngredientCategory, { icon: string; label: string }> = {
  proteins: { icon: "🥩", label: "Proteins" },
  vegetables: { icon: "🥬", label: "Vegetables" },
  fruits: { icon: "🍎", label: "Fruits" },
  grains: { icon: "🍞", label: "Grains" },
  dairy: { icon: "🧀", label: "Dairy" },
  seasonings: { icon: "🧂", label: "Seasonings" },
  pantry_staples: { icon: "🥫", label: "Pantry Staples" },
  others: { icon: "🧺", label: "Others" },
};

function formatCategoryLabel(category: IngredientCategory) {
  return CATEGORY_DETAILS[category]?.label ?? category.replace("_", " ");
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

interface ShoppingItemModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialItem?: ShoppingItem | null;
  defaultCategory: IngredientCategory;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    quantity: string;
    unit: string;
    category: IngredientCategory;
  }) => void;
  onDelete?: () => void;
}

function ShoppingItemSheet({ open, mode, initialItem, defaultCategory, onClose, onSubmit, onDelete }: ShoppingItemModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<IngredientCategory>(defaultCategory);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialItem?.name ?? "");
    setQuantity(initialItem && initialItem.totalQuantity > 0 ? String(initialItem.totalQuantity) : "");
    setUnit(initialItem?.unit ?? "");
    setCategory(initialItem?.category ?? defaultCategory);
    setIsEditingName(true);
    setIsEditingQuantity(true);
    setIsEditingCategory(true);
  }, [defaultCategory, initialItem, mode, open]);

  useEffect(() => {
    if (!open || mode !== "add") return;
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [mode, open]);

  if (!open) return null;
  const container = document.getElementById("phone-screen");
  if (!container) return null;

  const isSeasoning = category === "seasonings";
  const saveDisabled = name.trim().length === 0;

  return createPortal(
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border-subtle bg-card-base shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-muted text-text-primary transition-colors hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <div className="flex items-center gap-2">
            {mode === "edit" && onDelete && (
              <Button type="button" variant="ghost" className="text-error" onClick={onDelete}>
                Delete Item
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (saveDisabled) return;
                onSubmit({
                  name: name.trim(),
                  quantity: quantity.trim(),
                  unit: unit.trim(),
                  category,
                });
                onClose();
              }}
              disabled={saveDisabled}
            >
              {mode === "add" ? "Add Item" : "Save Item"}
            </Button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-base">SHOPPING ITEM</p>

          <div className="mt-2">
            {isEditingName ? (
              <Input
                id="shopping-item-name"
                ref={nameInputRef}
                placeholder=" Blueberries"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setIsEditingName(false)}
                className="h-auto rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-[22px] font-semibold leading-tight text-text-primary focus-visible:ring-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-left text-[22px] font-semibold leading-tight text-text-primary"
              >
                {name ? name : <span className="text-text-tertiary">Tap to add item name</span>}
              </button>
            )}
            {saveDisabled && <p className="mt-2 text-xs text-[#C67B7B]">Name is required.</p>}
          </div>

          <section className="mt-5">
            <h3 className="text-[14px] font-semibold text-text-primary">Quantity</h3>
            {isEditingQuantity ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input
                  id="shopping-item-quantity"
                  placeholder={isSeasoning ? "Optional" : "2"}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={isSeasoning}
                />
                <Input
                  id="shopping-item-unit"
                  placeholder={isSeasoning ? "" : "cups"}
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  disabled={isSeasoning}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingQuantity(true)}
                className="mt-3 text-[14px] text-text-tertiary"
              >
                {isSeasoning
                  ? "No quantity required for seasonings"
                  : quantity
                    ? `${quantity} ${unit}`.trim()
                    : "Tap to add quantity"}
              </button>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-[14px] font-semibold text-text-primary">Category</h3>
            {isEditingCategory ? (
              <select
                className="mt-3 h-11 w-full rounded-lg border border-border-tag bg-white px-4 text-[15px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base focus:ring-offset-2 focus:ring-offset-paper-base"
                value={category}
                onChange={(event) => setCategory(event.target.value as IngredientCategory)}
              >
                {INGREDIENT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {formatCategoryLabel(option)}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingCategory(true)}
                className="mt-3 text-[14px] text-text-secondary"
              >
                {formatCategoryLabel(category)}
              </button>
            )}
          </section>
        </div>
      </div>
    </div>,
    container,
  );
}

export function ShoppingPage() {
  const currentBook = useAppStore((state) => state.getCurrentMenuBook());
  const addShoppingItem = useAppStore((state) => state.addShoppingItem);
  const updateShoppingItem = useAppStore((state) => state.updateShoppingItem);
  const removeShoppingItem = useAppStore((state) => state.removeShoppingItem);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const globalError = useAppStore((state) => state.error);
  const { generateList } = useMealPlan();

  const {
    collapsedCategories,
    toggleCategoryCollapse,
    showAddItemModal,
    setShowAddItemModal,
    editingItem,
    setEditingItem,
  } = useShoppingStore();

  const [pendingDelete, setPendingDelete] = useState<ShoppingItem | null>(null);

  const groupedItems = useMemo(() => {
    const list = currentBook?.shoppingList?.items ?? [];
    return INGREDIENT_CATEGORIES.map((category) => ({
      category,
      items: list.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
  }, [currentBook]);

  const totalItems = currentBook?.shoppingList?.items?.length ?? 0;
  const defaultModalCategory = groupedItems[0]?.category ?? "proteins";
  const modalOpen = showAddItemModal || Boolean(editingItem);
  const modalMode: "add" | "edit" = editingItem ? "edit" : "add";

  const handleCloseModal = () => {
    setShowAddItemModal(false);
    setEditingItem(null);
  };

  const handleTogglePurchased = (item: ShoppingItem) => {
    if (!currentBook) return;
    updateShoppingItem(currentBook.id, item.id, { purchased: !item.purchased });
  };

  const handleSubmitItem = (payload: {
    name: string;
    quantity: string;
    unit: string;
    category: IngredientCategory;
  }) => {
    if (!currentBook) return;
    const totalQuantity = Number.parseFloat(payload.quantity);
    const normalizedQuantity = Number.isFinite(totalQuantity) && totalQuantity > 0 ? totalQuantity : 0;

    if (modalMode === "add") {
      addShoppingItem(currentBook.id, {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `manual_${Date.now()}`,
        name: payload.name,
        category: payload.category,
        totalQuantity: payload.category === "seasonings" ? 0 : normalizedQuantity,
        unit: payload.category === "seasonings" ? "" : payload.unit,
        purchased: false,
        isManuallyAdded: true,
      });
    } else if (editingItem) {
      updateShoppingItem(currentBook.id, editingItem.id, {
        name: payload.name,
        category: payload.category,
        totalQuantity: payload.category === "seasonings" ? 0 : normalizedQuantity,
        unit: payload.category === "seasonings" ? "" : payload.unit,
      });
    }
  };

  const handleRequestDelete = () => {
    if (!editingItem) return;
    setPendingDelete(editingItem);
    setEditingItem(null);
    setShowAddItemModal(false);
  };

  const handleConfirmDelete = () => {
    if (!currentBook || !pendingDelete) return;
    removeShoppingItem(currentBook.id, pendingDelete.id);
    setPendingDelete(null);
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handleGenerateList = async () => {
    if (!currentBook) return;
    try {
      await generateList(currentBook.mealPlan);
    } catch {
      // Error message routed through global store
    }
  };

  // Empty state - no current book
  if (!currentBook) {
    return (
      <PageContainer className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
          <span className="text-[44px]" aria-hidden>🛒</span>
        </div>
        <h2 className="mb-2 text-[20px] font-semibold text-text-primary">No shopping list yet</h2>
        <p className="text-[14px] text-text-secondary">Generate a shopping list from your meal plan</p>
      </PageContainer>
    );
  }

  // Empty state - has book but no shopping items
  if (totalItems === 0) {
    return (
      <PageContainer className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
          <span className="text-[44px]" aria-hidden>🛒</span>
        </div>
        <h2 className="mb-2 text-[20px] font-semibold text-text-primary">No shopping list yet</h2>
        <p className="mb-8 text-[14px] text-text-secondary">Generate a shopping list from your meal plan</p>
        <Button onClick={handleGenerateList} disabled={isGenerating} className="rounded-xl px-8 py-3">
          {isGenerating ? "Generating..." : "Generate from meal plan"}
        </Button>
        {globalError && !isGenerating && <p className="mt-4 text-sm text-error">{globalError}</p>}
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-3">
      {/* Category sections */}
      {groupedItems.map(({ category, items }) => {
        const details = CATEGORY_DETAILS[category];
        const isCollapsed = collapsedCategories[category];
        const itemCount = items.length;
        
        return (
          <section key={category} className="overflow-hidden rounded-xl border border-border-subtle bg-card-base">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleCategoryCollapse(category)}
              className="flex w-full items-center justify-between px-4 py-2.5"
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <span className="text-base">{details?.icon}</span>
                {details?.label}
              </span>
              <span className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span>{itemCount} items</span>
                {isCollapsed ? <PlusIcon /> : <MinusIcon />}
              </span>
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="border-t border-border-subtle">
                {items.map((item) => {
                  const purchased = item.purchased;
                  const showQuantity = item.category !== "seasonings" && item.totalQuantity > 0;
                  const quantityText = showQuantity ? `${item.totalQuantity} ${item.unit}`.trim() : "";

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleTogglePurchased(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleTogglePurchased(item);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 border-b border-border-subtle px-4 py-2.5 transition-colors hover:bg-paper-muted/50 last:border-b-0",
                        purchased && "opacity-60"
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-[1.5px] transition-colors",
                          purchased
                            ? "border-success bg-success text-white"
                            : "border-text-disabled bg-white"
                        )}
                      >
                        {purchased && <CheckIcon />}
                      </div>

                      {/* Item name + quantity */}
                      <div className="flex-1">
                        <span
                          className={cn(
                            "block text-[14px] font-medium",
                            purchased ? "text-text-secondary line-through" : "text-text-primary"
                          )}
                        >
                          {item.name}
                        </span>
                        {quantityText && (
                          <span className="mt-0.5 block text-[11px] text-text-tertiary">
                            {quantityText}
                          </span>
                        )}
                      </div>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingItem(item);
                        }}
                        className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary"
                      >
                        EDIT
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <ShoppingItemSheet
        open={modalOpen && Boolean(currentBook)}
        mode={modalMode}
        initialItem={editingItem ?? undefined}
        defaultCategory={editingItem?.category ?? defaultModalCategory}
        onClose={handleCloseModal}
        onSubmit={handleSubmitItem}
        onDelete={modalMode === "edit" ? handleRequestDelete : undefined}
      />

      <Modal
        open={Boolean(pendingDelete)}
        title="Remove item?"
        description={`This will delete ${pendingDelete?.name ?? "the item"} from your shopping list.`}
        onClose={handleCancelDelete}
        className="max-w-sm"
        showCloseButton={false}
      >
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button type="button" className="bg-error text-white hover:bg-error/90" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
