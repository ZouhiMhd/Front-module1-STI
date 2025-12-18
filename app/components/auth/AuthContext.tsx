"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  DoctorProfile,
  LoginData,
  RegisterData,
  AuthResponse,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
} from "@/lib/auth/client";

interface AuthContextType {
  doctor: DoctorProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setDoctor(user);
    } catch {
      setDoctor(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (checkIsAuthenticated()) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const result = await apiLogin(data);
    if (result.success && result.data) {
      setDoctor(result.data.doctor);
    }
    return result;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const result = await apiRegister(data);
    if (result.success && result.data) {
      setDoctor(result.data.doctor);
    }
    return result;
  };

  const logout = () => {
    apiLogout();
    setDoctor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        isLoading,
        isAuthenticated: !!doctor,
        login,
        register,
        logout,
        refreshUser,
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
