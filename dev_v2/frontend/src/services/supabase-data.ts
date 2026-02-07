import { supabase } from "@/lib/supabase";
import type { MenuBook, ShoppingList, UserPreferences } from "@/types";

// ---------- Type helpers for DB rows ----------

interface ProfileRow {
  id: string;
  display_name: string | null;
  preferences: UserPreferences | null;
  current_week_id: string | null;
  current_day_index: number;
  is_menu_open: boolean;
}

interface MenuBookRow {
  id: string;
  user_id: string;
  status: string;
  preferences: UserPreferences;
  menus: MenuBook["menus"];
  shopping_list: ShoppingList | null;
  created_at: string;
  updated_at: string;
}

// ---------- Profile ----------

export async function fetchProfile(): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // no row
    throw error;
  }
  return data as ProfileRow;
}

export async function updateProfile(updates: Partial<Pick<ProfileRow, "display_name" | "preferences" | "current_week_id" | "current_day_index" | "is_menu_open">>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);
  if (error) throw error;
}

// ---------- Menu Books ----------

function rowToMenuBook(row: MenuBookRow): MenuBook {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status as MenuBook["status"],
    preferences: row.preferences,
    menus: row.menus,
    shoppingList: row.shopping_list as ShoppingList,
  };
}

function menuBookToRow(book: MenuBook, userId: string): Omit<MenuBookRow, "updated_at"> {
  return {
    id: book.id,
    user_id: userId,
    status: book.status,
    preferences: book.preferences,
    menus: book.menus,
    shopping_list: book.shoppingList ?? null,
    created_at: book.createdAt,
  };
}

export async function fetchMenuBooks(): Promise<MenuBook[]> {
  const { data, error } = await supabase
    .from("menu_books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as MenuBookRow[]).map(rowToMenuBook);
}

export async function upsertMenuBook(book: MenuBook) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const row = menuBookToRow(book, user.id);
  const { error } = await supabase
    .from("menu_books")
    .upsert(row, { onConflict: "id" });
  if (error) throw error;
}

export async function updateMenuBookField(bookId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from("menu_books")
    .update(updates)
    .eq("id", bookId);
  if (error) throw error;
}

export async function deleteMenuBook(id: string) {
  const { error } = await supabase
    .from("menu_books")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
