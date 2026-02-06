import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useShoppingStore } from "@/stores/useShoppingStore";
import { INGREDIENT_CATEGORIES, INGREDIENT_CATEGORY_DETAILS } from "@/utils/constants";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { IngredientCategory, ShoppingItem } from "@/types";
import { cn } from "@/utils/cn";

function formatCategoryLabel(category: IngredientCategory) {
  return INGREDIENT_CATEGORY_DETAILS[category]?.label ?? category.replace("_", " ");
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ui-icon-strong" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
  const initialName = initialItem?.name ?? "";
  const initialQuantity = initialItem && initialItem.totalQuantity > 0 ? String(initialItem.totalQuantity) : "";
  const initialUnit = initialItem?.unit ?? "";
  const initialCategory = initialItem?.category ?? defaultCategory;

  const [name, setName] = useState(initialName);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [unit, setUnit] = useState(initialUnit);
  const [category, setCategory] = useState<IngredientCategory>(initialCategory);
  const [isEditingName, setIsEditingName] = useState(true);
  const [isEditingQuantity, setIsEditingQuantity] = useState(true);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || mode !== "add") return;
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [mode, open]);

  useEffect(() => {
    if (!isEditingCategory) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!categoryDropdownRef.current) return;
      if (!categoryDropdownRef.current.contains(event.target as Node)) {
        setIsEditingCategory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingCategory]);

  if (!open) return null;
  const container = document.getElementById("phone-screen") ?? document.body;

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
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onPointerDown={(event) => {
              event.preventDefault();
              onClose();
            }}
            className="h-9 w-9 rounded-full bg-paper-muted text-text-primary hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon />
          </Button>
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
          <p className="ui-label-soft text-accent-base">SHOPPING ITEM</p>

          <div className="mt-2">
            {isEditingName ? (
              <Input
                id="shopping-item-name"
                ref={nameInputRef}
                placeholder=" Blueberries"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setIsEditingName(false)}
                className="h-auto rounded-xl border border-border-subtle bg-transparent px-3 py-2 ui-heading focus-visible:ring-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-left ui-heading"
              >
                {name ? name : <span className="text-text-tertiary">Tap to add item name</span>}
              </button>
            )}
            {saveDisabled && <p className="mt-2 ui-caption text-[#C67B7B]">Name is required.</p>}
          </div>

          <section className="mt-5">
            <h3 className="ui-heading-sm">Quantity</h3>
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
                className="mt-3 ui-body text-text-tertiary"
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
            <h3 className="ui-heading-sm">Category</h3>
            <div className="relative mt-3" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsEditingCategory((prev) => !prev)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-border-subtle bg-paper-base px-3.5 ui-body text-text-primary hover:bg-paper-muted/50"
              >
                <span className="flex items-center gap-2">
                  {(() => {
                    const Icon = INGREDIENT_CATEGORY_DETAILS[category]?.icon;
                    return Icon ? <Icon className="h-4 w-4 text-accent-base/80 ui-icon" aria-hidden /> : null;
                  })()}
                  <span>{formatCategoryLabel(category)}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-text-tertiary ui-icon" aria-hidden />
              </button>
              {isEditingCategory && (
                <div className="absolute left-1/2 bottom-full z-20 mb-2 w-full max-h-40 -translate-x-1/2 overflow-y-auto rounded-2xl border border-border-subtle bg-card-base py-2 shadow-soft">
                  {INGREDIENT_CATEGORIES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCategory(option);
                        setIsEditingCategory(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-6 py-2 ui-body hover:bg-paper-muted",
                        option === category
                          ? "bg-accent-soft font-semibold text-accent-base"
                          : "text-text-primary",
                      )}
                    >
                      {(() => {
                        const Icon = INGREDIENT_CATEGORY_DETAILS[option]?.icon;
                        return Icon ? <Icon className="h-4 w-4 text-accent-base/80 ui-icon" aria-hidden /> : null;
                      })()}
                      <span>{formatCategoryLabel(option)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
  const navigate = useNavigate();

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

  const handleBackToMenu = () => {
    navigate("/");
  };

  // Empty state - no current book
  if (!currentBook) {
    return (
      <PageContainer className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
          <ShoppingCart className="h-10 w-10 text-accent-base ui-icon-strong" aria-hidden />
        </div>
        <h2 className="mb-2 ui-title-sm">No shopping list yet</h2>
        <p className="ui-body">Generate a shopping list from your menu</p>
      </PageContainer>
    );
  }

  // Empty state - has book but no shopping items
  if (totalItems === 0) {
    return (
      <PageContainer className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-3xl border border-border-subtle bg-paper-muted">
          <ShoppingCart className="h-10 w-10 text-accent-base ui-icon-strong" aria-hidden />
        </div>
        <h2 className="mb-2 ui-title-sm">No shopping list yet</h2>
        <p className="mb-8 ui-body">
          Shopping lists are generated when you create or modify your menu.
        </p>
        <Button onClick={handleBackToMenu} size="lg" className="px-8">
          Back to Menu
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="ui-stack">
      {/* Category sections */}
      {groupedItems.map(({ category, items }) => {
        const details = INGREDIENT_CATEGORY_DETAILS[category];
        const isCollapsed = collapsedCategories[category];
        const itemCount = items.length;
        const Icon = details?.icon;
        
        return (
          <section key={category} className="overflow-hidden rounded-2xl border border-border-subtle bg-card-base">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleCategoryCollapse(category)}
              className="flex w-full items-center justify-between px-4 py-2.5"
            >
              <span className="flex items-center gap-2 ui-body-strong">
                {Icon && <Icon className="h-4 w-4 text-accent-base/80 ui-icon" aria-hidden />}
                {details?.label}
              </span>
              <span className="flex items-center gap-2 ui-caption">
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
                            "block ui-body-strong",
                            purchased ? "text-text-secondary line-through" : "text-text-primary"
                          )}
                        >
                          {item.name}
                        </span>
                        {quantityText && (
                          <span className="mt-0.5 block ui-caption-soft">
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
                        aria-label={`Edit ${item.name}`}
                        className="ui-label-soft text-text-secondary hover:text-text-primary"
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

      {modalOpen && Boolean(currentBook) && (
        <ShoppingItemSheet
          key={modalMode === "edit" ? editingItem?.id ?? "edit" : `add-${defaultModalCategory}`}
          open
          mode={modalMode}
          initialItem={editingItem ?? undefined}
          defaultCategory={editingItem?.category ?? defaultModalCategory}
          onClose={handleCloseModal}
          onSubmit={handleSubmitItem}
          onDelete={modalMode === "edit" ? handleRequestDelete : undefined}
        />
      )}

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
