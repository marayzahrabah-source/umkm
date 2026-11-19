"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Business, UserProfile, UserRole } from "@/types/umkm";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface UserContextValue {
  authUser: User | null;
  profile: UserProfile | null;
  business: Business | null;
  role: UserRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);

      if (!user) {
        setProfile(null);
        setBusiness(null);
        setLoading(false);
        return;
      }

      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userProfile) {
        setProfile(userProfile as UserProfile);
        const { data: biz } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", userProfile.business_id)
          .single();
        setBusiness(biz as Business | null);
      }
    } catch {
      // Ignore if env vars not set yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    setBusiness(null);
    router.push("/login");
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  return (
    <UserContext.Provider
      value={{
        authUser,
        profile,
        business,
        role: profile?.role ?? null,
        loading,
        refreshProfile: fetchProfile,
        signOut,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
