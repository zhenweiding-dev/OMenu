import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { WeeklyMealPlan, ShoppingList } from '@/types';
import { DB_NAME, DB_VERSION, STORES } from '@/utils/constants';

// ===== Database Schema =====
interface OMenuDBSchema extends DBSchema {
  mealPlans: {
    key: string;
    value: WeeklyMealPlan;
    indexes: {
      'by-created': Date;
      'by-week-start': Date;
    };
  };
  shoppingLists: {
    key: string;
    value: ShoppingList;
    indexes: {
      'by-plan': string;
      'by-created': Date;
    };
  };
}

// ===== Database Singleton =====
let dbPromise: Promise<IDBPDatabase<OMenuDBSchema>> | null = null;

export async function initDB(): Promise<IDBPDatabase<OMenuDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<OMenuDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Meal Plans store
        if (!db.objectStoreNames.contains(STORES.MEAL_PLANS)) {
          const planStore = db.createObjectStore(STORES.MEAL_PLANS, { keyPath: 'id' });
          planStore.createIndex('by-created', 'createdAt');
          planStore.createIndex('by-week-start', 'weekStartDate');
        }

        // Shopping Lists store
        if (!db.objectStoreNames.contains(STORES.SHOPPING_LISTS)) {
          const listStore = db.createObjectStore(STORES.SHOPPING_LISTS, { keyPath: 'id' });
          listStore.createIndex('by-plan', 'mealPlanId');
          listStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

// ===== Meal Plans =====
export async function saveMealPlan(plan: WeeklyMealPlan): Promise<void> {
  const db = await initDB();
  await db.put(STORES.MEAL_PLANS, plan);
}

export async function getMealPlan(id: string): Promise<WeeklyMealPlan | undefined> {
  const db = await initDB();
  return db.get(STORES.MEAL_PLANS, id);
}

export async function getAllMealPlans(): Promise<WeeklyMealPlan[]> {
  const db = await initDB();
  const plans = await db.getAll(STORES.MEAL_PLANS);
  // Sort by createdAt descending (newest first)
  return plans.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

export async function deleteMealPlan(id: string): Promise<void> {
  const db = await initDB();
  await db.delete(STORES.MEAL_PLANS, id);
  // Also delete associated shopping list
  const shoppingList = await getShoppingListByPlanId(id);
  if (shoppingList) {
    await deleteShoppingList(shoppingList.id);
  }
}

export async function updateMealPlanStatus(
  id: string,
  status: WeeklyMealPlan['status']
): Promise<void> {
  const db = await initDB();
  const plan = await db.get(STORES.MEAL_PLANS, id);
  if (plan) {
    plan.status = status;
    await db.put(STORES.MEAL_PLANS, plan);
  }
}

// ===== Shopping Lists =====
export async function saveShoppingList(list: ShoppingList): Promise<void> {
  const db = await initDB();
  await db.put(STORES.SHOPPING_LISTS, list);
}

export async function getShoppingList(id: string): Promise<ShoppingList | undefined> {
  const db = await initDB();
  return db.get(STORES.SHOPPING_LISTS, id);
}

export async function getShoppingListByPlanId(planId: string): Promise<ShoppingList | undefined> {
  const db = await initDB();
  const tx = db.transaction(STORES.SHOPPING_LISTS, 'readonly');
  const index = tx.store.index('by-plan');
  return index.get(planId);
}

export async function getAllShoppingLists(): Promise<ShoppingList[]> {
  const db = await initDB();
  const lists = await db.getAll(STORES.SHOPPING_LISTS);
  // Sort by createdAt descending (newest first)
  return lists.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

export async function deleteShoppingList(id: string): Promise<void> {
  const db = await initDB();
  await db.delete(STORES.SHOPPING_LISTS, id);
}

export async function updateShoppingListItem(
  listId: string,
  itemId: string,
  updates: Partial<ShoppingList['items'][0]>
): Promise<void> {
  const db = await initDB();
  const list = await db.get(STORES.SHOPPING_LISTS, listId);
  if (list) {
    const itemIndex = list.items.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      list.items[itemIndex] = { ...list.items[itemIndex], ...updates };
      await db.put(STORES.SHOPPING_LISTS, list);
    }
  }
}

export async function addShoppingListItem(
  listId: string,
  item: ShoppingList['items'][0]
): Promise<void> {
  const db = await initDB();
  const list = await db.get(STORES.SHOPPING_LISTS, listId);
  if (list) {
    list.items.push(item);
    await db.put(STORES.SHOPPING_LISTS, list);
  }
}

export async function removeShoppingListItem(listId: string, itemId: string): Promise<void> {
  const db = await initDB();
  const list = await db.get(STORES.SHOPPING_LISTS, listId);
  if (list) {
    list.items = list.items.filter((item) => item.id !== itemId);
    await db.put(STORES.SHOPPING_LISTS, list);
  }
}
