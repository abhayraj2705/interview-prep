import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((response) => setUser(response.data.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(payload) {
    const response = await authApi.login(payload);
    const { token, user: loggedInUser } = response.data.data;
    localStorage.setItem("token", token);
    setUser(loggedInUser);
  }

  async function register(payload) {
    const response = await authApi.register(payload);
    const { token, user: registeredUser } = response.data.data;
    localStorage.setItem("token", token);
    setUser(registeredUser);
  }

  async function logout() {
    await authApi.logout().catch(() => null);
    localStorage.removeItem("token");
    setUser(null);
  }

  async function updateProfile(payload) {
    const response = await authApi.updateProfile(payload);
    setUser(response.data.data.user);
    return response.data.data.user;
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
