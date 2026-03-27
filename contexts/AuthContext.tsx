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
  saveUsername: (t: string | null) => void;
  verifiedUsername: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

let logoutRef: (() => void) | null = null;

export const setLogout = (fn: () => void) => {
  logoutRef = fn;
};

export const getLogout = () => logoutRef;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

 

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      AsyncStorage.getItem("userId").then((id) => {
        AsyncStorage.getItem("role").then((r) => {
          AsyncStorage.getItem("username").then((u) => {
          if (!t || t === "undefined" || t === "null") {
            setToken(null);
            setUserId(null);
            setRole(null);
            setVerifiedUsername(null);
          } else {
            setToken(t);
            setUserId(id ? Number(id) : null);
            setRole(r);
            setVerifiedUsername(u);
          }
          setLoading(false);
        });
      });
    }); 
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

  const saveUsername = async (username: string | null) => {
    if (!username) {
      setVerifiedUsername(null);
      await AsyncStorage.removeItem("username");
    } else {
      setVerifiedUsername(username);
      await AsyncStorage.setItem("username", username);
    }
  }

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
    setRole(null);
    setVerifiedUsername(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("username");
  };

  useEffect(() => {
    setLogout(() => logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, setToken, loading, saveToken, logout, saveUserId, userId, isLoggingIn, saveRole, isAdmin, saveUsername, verifiedUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
