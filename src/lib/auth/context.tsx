// =============================================================================
// AuthProvider — single source of truth for the signed-in partner.
// -----------------------------------------------------------------------------
// Wraps Supabase auth + the public.profiles + public.user_roles rows into a
// single React context. Components consume it via useAuth(); data hooks
// consume useCurrentPartnerId() to scope every collection.
// =============================================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearAllCollections, reloadAllCollections } from "@/lib/data/store";

export type AppRole = "admin" | "partner";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  brand_name: string;
  whatsapp: string;
  logo_url: string | null;
  website: string | null;
  primary_color: string;
  secondary_color: string;
  status: string;
}

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isAdmin: boolean;
  partnerId: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (input: { email: string; password: string; full_name: string; brand_name?: string; whatsapp?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  

  const loadProfileAndRoles = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    const typedProfile = (prof as Profile | null) ?? null;
    setProfile(typedProfile);
    const list = ((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role);
    setRoles(list);

    return { profile: typedProfile, roles: list };
  }, []);

  // Initial session + auth listener.
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfileAndRoles(data.session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer to avoid deadlock in callback
        setTimeout(() => {
          loadProfileAndRoles(sess.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfileAndRoles]);

  // Reload all data-layer collections whenever the signed-in user changes.
  useEffect(() => {
    if (user) {
      reloadAllCollections();
    } else {
      clearAllCollections();
    }
  }, [user]);


  const signIn: AuthContextValue["signIn"] = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp: AuthContextValue["signUp"] = useCallback(async ({ email, password, full_name, brand_name, whatsapp }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: {
          full_name,
          brand_name: brand_name ?? "",
          whatsapp: whatsapp ?? "",
        },
      },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signOut: AuthContextValue["signOut"] = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  }, []);

  const requestPasswordReset: AuthContextValue["requestPasswordReset"] = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
    });
    return error ? { error: error.message } : {};
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfileAndRoles(user.id);
  }, [user, loadProfileAndRoles]);

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    session,
    user,
    profile,
    roles,
    isAdmin: roles.includes("admin"),
    partnerId: user?.id ?? null,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    refreshProfile,
  }), [loading, session, user, profile, roles, signIn, signUp, signOut, requestPasswordReset, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Returns the partner_id all data hooks should scope to. Falls back to the
 *  legacy single-partner id so SSR / unauthenticated views don't crash. */
export function useCurrentPartnerId(): string {
  const ctx = useContext(AuthContext);
  return ctx?.partnerId ?? "partner-current";
}
