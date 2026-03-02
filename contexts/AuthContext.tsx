import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  loading: boolean;
  saveUserId: (t: number | null) => void;
  saveToken: (t: string | null) => void;
  logout: () => void;
  userId: number | null;
  isLoggingIn: boolean;
  saveRole: (t: string | null) => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      AsyncStorage.getItem("userId").then((id) => {
        AsyncStorage.getItem("role").then((r) => {
        if (!t || t === "undefined" || t === "null") {
          setToken(null);
          setUserId(null);
          setRole(null);
        } else {
          setToken(t);
          setUserId(id ? Number(id) : null);
          setRole(r);
        }
        setLoading(false);
      })});
    });
  }, []);

  const saveUserId = async (userId: number | null) => {
    if (!userId) {
      setUserId(null);
      await AsyncStorage.removeItem("userId");
    } else {
      setUserId(userId);
      await AsyncStorage.setItem("userId", userId.toString());
    }
  };

  const saveRole = async (role: string | null) => {
    if (!role) {
      setRole(null);
      await AsyncStorage.removeItem("role");
    } else {
      setRole(role);
      await AsyncStorage.setItem("role", role);
    }
  };

  const isAdmin = role === "ROLE_ADMIN";

  const saveToken = async (newToken: string | null) => {
    setIsLoggingIn(true);
    if (!newToken) {
      setToken(null);
      await AsyncStorage.removeItem("token");
    } else {
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);
        setTimeout(() => {
        setIsLoggingIn(false);
      }, 1200);
    }
  };

  const logout = async () => {
    setToken(null);
    setUserId(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, loading, saveToken, logout, saveUserId, userId, isLoggingIn, saveRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
