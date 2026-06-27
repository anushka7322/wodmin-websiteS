import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) { setAdmin(null); setLoading(false); return; }
    try {
      const r = await api.get("/admin/me");
      setAdmin(r.data);
    } catch {
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const r = await api.post("/admin/login", { email, password });
    setToken(r.data.access_token);
    setAdmin(r.data.admin);
    return r.data.admin;
  };

  const logout = () => { setToken(null); setAdmin(null); };

  return <AuthCtx.Provider value={{ admin, loading, login, logout, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
