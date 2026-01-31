import { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/stores/useAppStore';
import { useShoppingStore } from '@/stores/useShoppingStore';
import { cn, formatQuantity, generateId } from '@/utils/helpers';
import { CATEGORY_LABELS, INGREDIENT_CATEGORIES } from '@/utils/constants';
import type { IngredientCategory, ShoppingItem } from '@/types';

// Add Item Modal
interface AddItemModalProps {
  onAdd: (item: Omit<ShoppingItem, 'id' | 'purchased'>) => void;
  onClose: () => void;
}

function AddItemModal({ onAdd, onClose }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('others');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      totalQuantity: quantity ? parseFloat(quantity) : 0,
      unit: unit.trim(),
      category,
      isManuallyAdded: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-card w-full max-w-md rounded-t-modal p-5 animate-slide-up">
        <h3 className="text-h3 text-primary-text mb-4">Add Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-body-sm text-secondary-text mb-1 block">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk"
              className="w-full px-4 py-3 border border-tag-border rounded-button text-body focus:border-accent focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-body-sm text-secondary-text mb-1 block">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-tag-border rounded-button text-body focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-body-sm text-secondary-text mb-1 block">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., lbs"
                className="w-full px-4 py-3 border border-tag-border rounded-button text-body focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-body-sm text-secondary-text mb-1 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IngredientCategory)}
              className="w-full px-4 py-3 border border-tag-border rounded-button text-body focus:border-accent focus:outline-none bg-white"
            >
              {INGREDIENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} fullWidth type="button">
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={!name.trim()}>
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Shopping Item Row
interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: () => void;
}

function ShoppingItemRow({ item, onToggle }: ShoppingItemRowProps) {
  const quantityText = formatQuantity(item.totalQuantity, item.unit, item.category);

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 py-3 w-full text-left hover:bg-paper-dark/50 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div
        className={cn(
          'w-[22px] h-[22px] rounded border-[1.5px] flex items-center justify-center transition-colors',
          item.purchased
            ? 'bg-success border-success'
            : 'bg-transparent border-disabled-text'
        )}
      >
        {item.purchased && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <span
        className={cn(
          'flex-1 text-body',
          item.purchased ? 'text-secondary-text line-through' : 'text-primary-text'
        )}
      >
        {item.name}
      </span>
      {quantityText && (
        <span
          className={cn(
            'text-body-sm',
            item.purchased ? 'text-disabled-text' : 'text-secondary-text'
          )}
        >
          {quantityText}
        </span>
      )}
    </button>
  );
}

// Category Section
interface CategorySectionProps {
  category: IngredientCategory;
  items: ShoppingItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  onItemToggle: (itemId: string) => void;
}

function CategorySection({
  category,
  items,
  isCollapsed,
  onToggle,
  onItemToggle,
}: CategorySectionProps) {
  const purchasedCount = items.filter((i) => i.purchased).length;

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 px-4 bg-paper-dark rounded-lg"
      >
        <span className="text-h3 text-primary-text">{CATEGORY_LABELS[category]}</span>
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-secondary-text">
            {purchasedCount}/{items.length}
          </span>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-secondary-text" />
          ) : (
            <ChevronUp className="w-5 h-5 text-secondary-text" />
          )}
        </div>
      </button>
      {!isCollapsed && (
        <div className="px-4 divide-y divide-divider">
          {items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onToggle={() => onItemToggle(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ShoppingPage() {
  const { currentPlanId, loadCurrentShoppingList } = useAppStore();
  const {
    list,
    isLoading,
    collapsedCategories,
    loadList,
    togglePurchased,
    addItem,
    toggleCategory,
    getItemsByCategory,
  } = useShoppingStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (currentPlanId) {
      loadList(currentPlanId);
    }
  }, [currentPlanId, loadList]);

  const itemsByCategory = getItemsByCategory();

  // Empty state
  if (!list || list.items.length === 0) {
    return (
      <PageContainer>
        <Header title="Shopping List" />
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-24 h-24 bg-paper-dark rounded-full flex items-center justify-center mb-6 border border-divider">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10 text-disabled-text"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <h2 className="text-h2 text-primary-text mb-2">No shopping list yet</h2>
          <p className="text-body text-secondary-text">
            Create a meal plan first to generate
            <br />a shopping list
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Shopping List"
        rightContent={
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center"
            aria-label="Add item"
          >
            <Plus className="w-[22px] h-[22px] text-primary-text" strokeWidth={1.8} />
          </button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-5 py-4">
          {Array.from(itemsByCategory.entries()).map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              isCollapsed={collapsedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
              onItemToggle={togglePurchased}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onAdd={(item) => addItem(item)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </PageContainer>
  );
}
