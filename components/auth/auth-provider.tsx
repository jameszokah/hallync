"use client";

import type React from "react";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase?.auth?.getSession();
        if (error) {
          throw error;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role from the database
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;

          setIsOwner(data?.role === "owner");
          setIsAdmin(data?.role === "admin");
        }
      } catch (error: any) {
        console.error("Error getting session:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      console.log("session in onAuthStateChange", session);

      if (session?.user) {
        // Fetch user role from the database
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!error && data) {
          setIsOwner(data.role === "owner");
          setIsAdmin(data.role === "admin");
        }
      }

      // Refresh the page to update server components
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signUp = async (email: string, password: string, metadata: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      // Create a user record in our users table
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: metadata.first_name,
          last_name: metadata.last_name,
          phone: metadata.phone,
          university: metadata.university,
          role: metadata.role || "student",
        });

        if (profileError) throw profileError;
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      });

      setTimeout(() => {
        toast({
          title: "Email confirmation sent",
          description: "Please check your email to confirm your account",
        });
      }, 1000);

      // If email confirmation is not required, sign in the user immediately
      if (data.session) {
        setSession(data.session);
        setUser(data.user);

        // Get the redirect URL from query params
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push(redirectTo);
      } else {
        router.push("/auth/login");
      }
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user role
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (userError) throw userError;

        setIsOwner(userData.role === "owner");
        setIsAdmin(userData.role === "admin");

        // Get the redirect URL from query params
        const redirectTo =
          searchParams.get("redirect") ||
          (userData.role === "admin"
            ? "/admin"
            : userData.role === "owner"
            ? "/owner/dashboard"
            : "/dashboard");

        router.push(redirectTo);
      }

      toast({
        title: "Welcome back",
        description: "You have successfully signed in",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setIsOwner(false);
      setIsAdmin(false);

      router.push("/");

      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    isOwner,
    isAdmin,
  };

  return (
    <>
      <Suspense>
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      </Suspense>
    </>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
