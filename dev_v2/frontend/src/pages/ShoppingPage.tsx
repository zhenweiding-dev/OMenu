import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useShoppingStore } from "@/stores/useShoppingStore";
import { useMealPlan } from "@/hooks/useMealPlan";
import { INGREDIENT_CATEGORIES } from "@/utils/constants";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { IngredientCategory, ShoppingItem } from "@/types";

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
          className="h-10 w-full rounded-md border border-border-subtle bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-base"
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
            className="text-accent-orange"
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
    }));
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

  return (
    <PageContainer className="space-y-8">
      <div className="flex justify-end">
        {currentBook && (
          <Button size="sm" onClick={() => setShowAddItemModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      {!currentBook && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-card-base p-10 text-center text-text-secondary">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-muted text-4xl" aria-hidden>
            🛒
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-text-primary">No shopping list yet</p>
            <p className="text-sm text-text-secondary">Generate a shopping list from your meal plan.</p>
          </div>
        </div>
      )}

      {currentBook && totalItems === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-card-base p-10 text-center text-text-secondary">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-muted text-4xl" aria-hidden>
            🛒
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-text-primary">No shopping list yet</p>
            <p className="text-sm text-text-secondary">Generate a shopping list from your meal plan.</p>
          </div>
          <Button onClick={handleGenerateList} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate from meal plan"}
          </Button>
          {globalError && !isGenerating && <p className="text-sm text-red-500">{globalError}</p>}
        </div>
      )}

      {currentBook && totalItems > 0 && (
        <section className="space-y-4">
          {groupedItems.map(({ category, items }) => {
            const details = CATEGORY_DETAILS[category];
            const isCollapsed = collapsedCategories[category];
            return (
              <div key={category} className="overflow-hidden rounded-3xl border border-border-subtle bg-card-base shadow-soft">
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(category)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-3 text-[15px] font-semibold text-text-primary">
                    <span className="text-xl" aria-hidden>
                      {details?.icon}
                    </span>
                    {details?.label ?? formatCategoryLabel(category)}
                    <span className="rounded-full bg-paper-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {items.length}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-text-secondary">
                    {isCollapsed ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`} />
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-3 border-t border-border-subtle bg-paper-base px-5 py-4">
                    {items.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-border-subtle px-4 py-3 text-sm text-text-secondary">
                        No items yet.
                      </div>
                    )}
                    {items.map((item) => {
                      const purchased = item.purchased;
                      const showQuantity = item.category !== "seasonings" && item.totalQuantity > 0;
                      const detailParts = [] as string[];
                      if (showQuantity) {
                        detailParts.push(`${item.totalQuantity} ${item.unit}`.trim());
                      }
                      detailParts.push(formatCategoryLabel(item.category));
                      const detailText = detailParts.filter(Boolean).join(" • ");
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Edit ${item.name}`}
                          onClick={() => setEditingItem(item)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setEditingItem(item);
                            }
                          }}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-card-base px-4 py-3 shadow-soft transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base"
                        >
                          <label
                            className="flex flex-1 items-center gap-3"
                            htmlFor={`purchased-${item.id}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <input
                              id={`purchased-${item.id}`}
                              type="checkbox"
                              checked={purchased}
                              onChange={() => handleTogglePurchased(item)}
                              className="h-5 w-5 rounded border border-text-disabled text-accent-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base"
                            />
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-medium ${
                                  purchased ? "text-text-secondary line-through" : "text-text-primary"
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-xs text-text-secondary">{detailText}</span>
                            </div>
                          </label>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                            Edit
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

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
          <Button type="button" className="bg-accent-orange hover:bg-accent-orangeLight text-white" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
