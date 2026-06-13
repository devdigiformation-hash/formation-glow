// Supabase-backed singleton store for admin profile + branding.
// Loaded once per session, kept fresh via realtime, visible to every signed-in
// partner across browsers and devices.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminSettings = {
  id: string;
  company_name: string;
  founder: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  company_logo: string | null;
  light_logo: string | null;
  dark_logo: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_website: string;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  id: "",
  company_name: "DigiFormation Ltd",
  founder: "Muhammad Haroon",
  website: "https://www.digiformation.uk",
  email: "info@digiformation.uk",
  phone: "+92 316 446 7464",
  whatsapp: "+92 316 446 7464",
  company_logo: null,
  light_logo: null,
  dark_logo: null,
  primary_color: "#22d3ee",
  secondary_color: "#a78bfa",
  accent_color: "#34d399",
  contact_email: "info@digiformation.uk",
  contact_phone: "+92 316 446 7464",
  contact_whatsapp: "+92 316 446 7464",
  contact_website: "https://www.digiformation.uk",
};

let cache: AdminSettings | null = null;
const CHANGE_EVENT = "digiform:admin-settings-changed";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

async function fetchRow(): Promise<AdminSettings | null> {
  // Public-safe read via SECURITY DEFINER RPC; admins still get the same
  // branding/contact fields, while AI budget thresholds stay private.
  const { data, error } = await (supabase.rpc as unknown as (fn: string) => Promise<{ data: unknown; error: { message: string } | null }>)("get_admin_settings_public");
  if (error) {
    console.warn("[admin_settings] load failed:", error.message);
    return null;
  }
  if (!data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as AdminSettings | null) ?? null;
}

let subscribed = false;
function ensureRealtime() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  supabase
    .channel("rt:admin_settings")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "admin_settings" },
      (payload) => {
        const next = payload.new as AdminSettings | null;
        if (next?.id) {
          cache = next;
          emit();
        }
      },
    )
    .subscribe();
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(cache ?? DEFAULT_ADMIN_SETTINGS);
  const [loaded, setLoaded] = useState<boolean>(cache != null);

  useEffect(() => {
    let cancelled = false;
    ensureRealtime();
    fetchRow().then((row) => {
      if (cancelled) return;
      if (row) {
        cache = row;
        setSettings(row);
      }
      setLoaded(true);
    });
    const onChange = () => {
      if (cache) setSettings(cache);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, []);

  const save = useCallback(async (patch: Partial<AdminSettings>) => {
    // Optimistic merge
    const optimistic = { ...(cache ?? settings), ...patch } as AdminSettings;
    cache = optimistic;
    setSettings(optimistic);
    emit();

    const payload: Record<string, unknown> = { ...patch };
    delete payload.id;

    if (!cache.id) {
      // Row missing — try insert (singleton ON CONFLICT handles dup)
      const { data, error } = await supabase
        .from("admin_settings")
        .upsert({ singleton: true, ...payload } as never, { onConflict: "singleton" })
        .select()
        .single();
      if (error) {
        console.error("[admin_settings] upsert failed:", error.message);
        return null;
      }
      cache = data as AdminSettings;
      setSettings(cache);
      emit();
      return cache;
    }

    const { data, error } = await supabase
      .from("admin_settings")
      .update(payload as never)
      .eq("id", cache.id)
      .select()
      .single();
    if (error) {
      console.error("[admin_settings] update failed:", error.message);
      // Re-pull
      const fresh = await fetchRow();
      if (fresh) {
        cache = fresh;
        setSettings(fresh);
        emit();
      }
      return null;
    }
    cache = data as AdminSettings;
    setSettings(cache);
    emit();
    return cache;
  }, [settings]);

  return { settings, save, loaded };
}
