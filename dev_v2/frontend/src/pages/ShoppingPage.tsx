import { useMemo, useState } from "react";
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

function ShoppingItemForm({
  mode,
  initialItem,
  defaultCategory,
  onClose,
  onSubmit,
  onDelete,
}: Omit<ShoppingItemModalProps, "open">) {
  const [name, setName] = useState(() => initialItem?.name ?? "");
  const [quantity, setQuantity] = useState(() =>
    initialItem && initialItem.totalQuantity > 0 ? String(initialItem.totalQuantity) : "",
  );
  const [unit, setUnit] = useState(() => initialItem?.unit ?? "");
  const [category, setCategory] = useState<IngredientCategory>(initialItem?.category ?? defaultCategory);

  const isSeasoning = category === "seasonings";
  const saveDisabled = name.trim().length === 0;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (saveDisabled) return;
        onSubmit({
          name: name.trim(),
          quantity: quantity.trim(),
          unit: unit.trim(),
          category,
        });
        onClose();
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="shopping-item-name">
          Item name
        </label>
        <Input
          id="shopping-item-name"
          placeholder="Blueberries"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="shopping-item-quantity">
            Quantity
          </label>
          <Input
            id="shopping-item-quantity"
            placeholder={isSeasoning ? "Optional" : "2"}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={isSeasoning}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="shopping-item-unit">
            Unit
          </label>
          <Input
            id="shopping-item-unit"
            placeholder={isSeasoning ? "" : "cups"}
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            disabled={isSeasoning}
          />
        </div>
      </div>
      {isSeasoning && (
        <p className="text-xs text-text-secondary">Seasonings do not require a quantity.</p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary" htmlFor="shopping-item-category">
          Category
        </label>
        <select
          id="shopping-item-category"
          className="h-11 w-full rounded-lg border border-border-tag bg-white px-4 text-[15px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base focus:ring-offset-2 focus:ring-offset-paper-base"
          value={category}
          onChange={(event) => setCategory(event.target.value as IngredientCategory)}
        >
          {INGREDIENT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {formatCategoryLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        {mode === "edit" && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="text-error"
            onClick={() => onDelete()}
          >
            Delete item
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveDisabled}>
            {mode === "add" ? "Add item" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ShoppingItemModal({ open, mode, initialItem, defaultCategory, onClose, onSubmit, onDelete }: ShoppingItemModalProps) {
  if (!open) return null;
  const modalKey = initialItem ? `edit-${initialItem.id}` : `add-${defaultCategory}`;

  return (
    <Modal open={open} className="max-w-md" title={mode === "add" ? "Add Item" : "Edit Item"}>
      <ShoppingItemForm
        key={modalKey}
        mode={mode}
        initialItem={initialItem}
        defaultCategory={defaultCategory}
        onClose={onClose}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />
    </Modal>
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
    <PageContainer className="space-y-5">
      {/* Category sections */}
      {groupedItems.map(({ category, items }) => {
        const details = CATEGORY_DETAILS[category];
        const isCollapsed = collapsedCategories[category];
        const itemCount = items.length;
        
        return (
          <section key={category} className="space-y-0">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleCategoryCollapse(category)}
              className="flex w-full items-center justify-between py-3"
            >
              <span className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
                <span className="text-lg">{details?.icon}</span>
                {details?.label}
              </span>
              <span className="flex items-center gap-2 text-[12px] text-text-secondary">
                <span>{itemCount} items</span>
                {isCollapsed ? <PlusIcon /> : <MinusIcon />}
              </span>
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="space-y-0">
                {items.map((item) => {
                  const purchased = item.purchased;
                  const showQuantity = item.category !== "seasonings" && item.totalQuantity > 0;
                  const quantityText = showQuantity ? `${item.totalQuantity} ${item.unit}`.trim() : "";

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setEditingItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setEditingItem(item);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 border-b border-border-subtle py-3 transition-colors hover:bg-paper-muted/50",
                        purchased && "opacity-60"
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleTogglePurchased(item);
                        }}
                        className={cn(
                          "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded border-[1.5px] transition-colors",
                          purchased
                            ? "border-success bg-success text-white"
                            : "border-text-disabled bg-white"
                        )}
                      >
                        {purchased && <CheckIcon />}
                      </button>

                      {/* Item name */}
                      <span
                        className={cn(
                          "flex-1 text-[15px]",
                          purchased ? "text-text-secondary line-through" : "text-text-primary"
                        )}
                      >
                        {item.name}
                      </span>

                      {/* Quantity */}
                      {quantityText && (
                        <span className="text-[13px] text-text-secondary">{quantityText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <ShoppingItemModal
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
