"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((r) => { setUser(r.data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    setUser(r.data.user);
    setToken(r.data.token);
    return r.data;
  };

  const register = async (name, email, password) => {
    const r = await api.post("/auth/register", { name, email, password });
    setUser(r.data.user);
    setToken(r.data.token);
    return r.data;
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setToken(null);
  };

  const updateUser = (patch) => setUser((p) => ({ ...p, ...patch }));

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};