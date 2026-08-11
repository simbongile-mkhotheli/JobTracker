import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./authContext";
import { getAuthErrorDiagnostics } from "../utils/authErrors";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error(
            "Failed to load session:",
            getAuthErrorDiagnostics(error, "loadSession"),
          );
          setSession(null);
          setUser(null);
          return;
        }

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      } catch (err) {
        if (!isMounted) return;

        console.error(
          "Failed to load session:",
          getAuthErrorDiagnostics(err, "loadSession"),
        );
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
