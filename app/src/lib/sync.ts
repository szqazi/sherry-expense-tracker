import { supabase } from "./supabase";
import type { Entry, Settings } from "./types";

interface EntryRow {
  id: string;
  user_id: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

function entryToRow(entry: Entry, userId: string): EntryRow {
  return {
    id: entry.id,
    user_id: userId,
    type: entry.type,
    category: entry.category,
    amount: entry.amount,
    currency: entry.currency,
    comment: entry.comment,
    date: entry.date,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    type: row.type as Entry["type"],
    category: row.category,
    amount: Number(row.amount),
    currency: row.currency as Entry["currency"],
    comment: row.comment,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Union by id; when both sides have the same id, keep whichever was edited
// more recently. This is what lets two devices that synced independently
// reconcile without either one just clobbering the other.
export function mergeEntries(local: Entry[], remote: Entry[]): Entry[] {
  const byId = new Map<string, Entry>();
  for (const e of local) byId.set(e.id, e);
  for (const e of remote) {
    const existing = byId.get(e.id);
    if (!existing || e.updatedAt > existing.updatedAt) {
      byId.set(e.id, e);
    }
  }
  return [...byId.values()];
}

export async function pullRemoteEntries(userId: string): Promise<Entry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("entries").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data as EntryRow[]).map(rowToEntry);
}

export async function pushEntry(entry: Entry, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("entries").upsert(entryToRow(entry, userId));
  if (error) throw error;
}

export async function pushEntries(entries: Entry[], userId: string): Promise<void> {
  if (!supabase || entries.length === 0) return;
  const { error } = await supabase.from("entries").upsert(entries.map((e) => entryToRow(e, userId)));
  if (error) throw error;
}

export async function deleteRemoteEntry(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
}

export async function pullRemoteSettings(userId: string): Promise<Settings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("settings")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as Settings) ?? null;
}

export async function pushSettings(settings: Settings, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("settings")
    .upsert({ user_id: userId, data: settings, updated_at: new Date().toISOString() });
  if (error) throw error;
}
