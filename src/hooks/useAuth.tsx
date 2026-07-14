import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialSessionClearInProgress = useRef(false);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return !!data;
  };

  useEffect(() => {
    // Set up auth state listener FIRST (always, regardless of session flag)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Don't trigger admin checks for PASSWORD_RECOVERY events
        if (event === 'PASSWORD_RECOVERY') {
          return; // Let ResetPassword page handle this
        }

        // Defer admin check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id).then((admin) => {
              setIsAdmin(admin);
              setLoading(false);
            });
          }, 0);
        } else if (initialSessionClearInProgress.current) {
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Force re-login if this is a new browser session (tab was closed)
    const sessionFlag = sessionStorage.getItem('unikey_session_active');
    if (!sessionFlag) {
      // New session — sign out any persisted auth, then mark session active
      initialSessionClearInProgress.current = true;
      sessionStorage.setItem('unikey_session_active', 'true');
      supabase.auth.signOut().finally(() => {
        initialSessionClearInProgress.current = false;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });
    } else {
      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkAdminStatus(session.user.id).then((admin) => {
            setIsAdmin(admin);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    sessionStorage.setItem('unikey_session_active', 'true');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
