// =============================================================================
// Supabase-backed Collection store.
// -----------------------------------------------------------------------------
// Each table in `./types` gets one Collection instance. The class keeps an
// in-memory cache so all existing synchronous reads (`c.get(id)`, `c.list()`)
// continue to work, while mutations are forwarded to Supabase. Realtime
// `postgres_changes` events keep the cache in sync across tabs/devices.
//
// The public API is unchanged from the previous localStorage implementation:
// `c.list()`, `c.get(id)`, `c.insert(input)`, `c.update(id, patch)`,
// `c.remove(id)`, plus the `useCollection(c)` hook.
// =============================================================================

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CHANGE_EVENT = "digiform:data-changed";

function emit(table: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { table } }));
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface CollectionOptions<T> {
  /** Postgres table name in the `public` schema. */
  table: string;
  /** Optional id prefix — retained for API compatibility, unused for uuid PKs. */
  idPrefix?: string;
  /** Legacy options kept so call sites compile; ignored. */
  seed?: T[];
  storageKey?: string;
}

type AnyRow = { id: string } & Record<string, unknown>;

export class Collection<T extends { id: string }> {
  readonly table: string;
  private cache = new Map<string, T>();
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;
  private subscribed = false;

  constructor(opts: CollectionOptions<T>) {
    this.table = opts.table;
    ALL_COLLECTIONS.add(this as unknown as Collection<{ id: string }>);
  }

  // ---- internal cache I/O ----------------------------------------------
  private setMany(rows: T[]) {
    this.cache.clear();
    for (const r of rows) this.cache.set(r.id, r);
    emit(this.table);
  }

  private setOne(row: T) {
    this.cache.set(row.id, row);
    emit(this.table);
  }

  private deleteOne(id: string) {
    if (this.cache.delete(id)) emit(this.table);
  }

  /** Reload from Supabase. Single-flight: concurrent calls share one promise. */
  async load(): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = (async () => {
      const { data, error } = await supabase
        .from(this.table as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        // Most often RLS / not signed in. Keep cache empty.
        // eslint-disable-next-line no-console
        console.warn(`[${this.table}] load failed:`, error.message);
        this.loaded = true;
        return;
      }
      this.setMany((data ?? []) as unknown as T[]);
      this.loaded = true;
    })();
    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  /** Subscribe to realtime postgres_changes for this table. Idempotent. */
  subscribe() {
    if (this.subscribed || typeof window === "undefined") return;
    this.subscribed = true;
    supabase
      .channel(`rt:${this.table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: this.table },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const old = payload.old as AnyRow | null;
            if (old?.id) this.deleteOne(old.id);
          } else {
            const next = payload.new as AnyRow | null;
            if (next?.id) this.setOne(next as unknown as T);
          }
        },
      )
      .subscribe();
  }

  /** Force a reload — useful after auth changes. */
  reload() {
    this.loaded = false;
    return this.load();
  }

  /** Clear cache (e.g. on sign-out). */
  clear() {
    this.cache.clear();
    this.loaded = false;
    emit(this.table);
  }

  // ---- query ------------------------------------------------------------
  list(): T[] {
    return Array.from(this.cache.values());
  }

  get(id: string): T | null {
    return this.cache.get(id) ?? null;
  }

  where(predicate: (row: T) => boolean): T[] {
    return this.list().filter(predicate);
  }

  // ---- mutate -----------------------------------------------------------
  /**
   * Optimistic insert: writes the row to the cache immediately so the UI
   * updates synchronously, then forwards to Supabase. Realtime reconciles
   * the server-authoritative copy when it arrives.
   */
  insert(input: Omit<T, "id" | "created_at" | "updated_at"> & Partial<Pick<T, "id">>): T {
    const created_at = nowIso();
    const id = (input as { id?: string }).id ?? uuid();
    const row = {
      ...(input as object),
      id,
      created_at,
      updated_at: created_at,
    } as unknown as T;
    this.setOne(row);

    // Strip client-only updated_at so DB triggers own it (some tables omit it).
    const payload: Record<string, unknown> = { ...(row as unknown as Record<string, unknown>) };
    delete payload.updated_at;
    supabase
      .from(this.table as never)
      .insert(payload as never)
      .then(({ error }) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(`[${this.table}] insert failed:`, error.message);
          this.deleteOne(id);
        }
      });
    return row;
  }

  update(id: string, patch: Partial<T>): T | null {
    const existing = this.cache.get(id);
    if (!existing) return null;
    const next = { ...existing, ...patch, updated_at: nowIso() } as T;
    this.setOne(next);

    const payload: Record<string, unknown> = { ...(patch as Record<string, unknown>) };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;
    supabase
      .from(this.table as never)
      .update(payload as never)
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(`[${this.table}] update failed:`, error.message);
          // Re-pull to re-sync.
          this.reload();
        }
      });
    return next;
  }

  remove(id: string): boolean {
    const existed = this.cache.has(id);
    if (!existed) return false;
    const snapshot = this.cache.get(id)!;
    this.deleteOne(id);
    supabase
      .from(this.table as never)
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(`[${this.table}] delete failed:`, error.message);
          this.setOne(snapshot);
        }
      });
    return true;
  }

  /** Legacy API — kept so any callers still compile. */
  replaceAll(rows: T[]) {
    this.setMany(rows);
  }

  reset() {
    this.clear();
  }
}

/** Track every Collection so AuthProvider can flush them on sign-out. */
const ALL_COLLECTIONS = new Set<Collection<{ id: string }>>();

export function registerCollection<T extends { id: string }>(c: Collection<T>) {
  ALL_COLLECTIONS.add(c as unknown as Collection<{ id: string }>);
  return c;
}

export function reloadAllCollections() {
  return Promise.all(Array.from(ALL_COLLECTIONS).map((c) => c.reload()));
}

export function clearAllCollections() {
  for (const c of ALL_COLLECTIONS) c.clear();
}

/**
 * Reactively subscribe to a Collection. Loads from Supabase + subscribes to
 * realtime on first mount; re-renders whenever the cache for this `table`
 * changes (locally or via realtime).
 */
export function useCollection<T extends { id: string }>(collection: Collection<T>): T[] {
  const [rows, setRows] = useState<T[]>(() => collection.list());

  useEffect(() => {
    let cancelled = false;
    const sync = () => {
      if (!cancelled) setRows(collection.list());
    };

    // Load once + subscribe.
    collection.load().then(sync);
    collection.subscribe();
    sync();

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ table: string }>).detail;
      if (!detail || detail.table === collection.table) sync();
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, [collection]);

  return rows;
}
