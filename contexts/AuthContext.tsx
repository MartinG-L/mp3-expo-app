import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  loading: boolean;
  saveUserId: (t: number | null) => void,
  saveToken: (t: string | null) => void,
  logout: () => void,
  userId: number | null;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  loading: true,
  logout: ()=>{},
  saveToken: ()=>{},
  saveUserId: ()=>{},
  userId: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      AsyncStorage.getItem("userId").then((id) => {
        if (!t || t === "undefined" || t === "null") {
          setToken(null);
          setUserId(null);
        } else {
          setToken(t);
          setUserId(id ? Number(id) : null);
        }
        setLoading(false);
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

  const saveToken = async (newToken: string | null) => {
    if (!newToken) {
      setToken(null);
      await AsyncStorage.removeItem("token");
    } else {
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);
    }
  };

  const logout = async () => {
    setToken(null);
    setUserId(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, loading, saveToken, logout, saveUserId, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
