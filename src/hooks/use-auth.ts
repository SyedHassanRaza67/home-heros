import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Enums } from "@/integrations/supabase/types";
type AppRole = Enums<"app_role">;

export type AuthState = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // defer to next tick to avoid deadlock
        setTimeout(() => {
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", s.user.id)
            .then(({ data }) => setRoles((data ?? []).map((r) => r.role)));
        }, 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .then(({ data: rd }) => setRoles((rd ?? []).map((r) => r.role)));
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    roles,
    isAdmin: roles.includes("admin"),
    loading,
  };
}
