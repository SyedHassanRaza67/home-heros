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
  isProvider: boolean;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async (uid: string) => {
      setRolesLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      setRoles((data ?? []).map((r) => r.role));
      setRolesLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setRolesLoading(true);
        loadRoles(s.user.id);
      } else {
        setRoles([]);
        setRolesLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadRoles(data.session.user.id);
      } else {
        setRolesLoading(false);
      }
      setSessionLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  return {
    session,
    user,
    roles,
    isAdmin: roles.includes("admin"),
    isProvider: roles.includes("provider"),
    loading: sessionLoading || (!!user && rolesLoading),
  };
}
