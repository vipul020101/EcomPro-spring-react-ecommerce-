import { createContext, useCallback, useMemo, useState } from "react";
import API from "../axios";

const AuthContext = createContext({
  user: null,
  token: "",
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

const safeJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => safeJson(localStorage.getItem("user") || "null", null));

  const persist = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
    } else {
      localStorage.removeItem("token");
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
    }

    setToken(nextToken || "");
    setUser(nextUser || null);
  };

  const login = useCallback(async ({ email, password }) => {
    const response = await API.post("/auth/login", { email, password });
    persist(response.data.token, response.data.user);
    return response.data;
  }, []);

  const signup = useCallback(async ({ name, email, password, phone }) => {
    const response = await API.post("/auth/signup", { name, email, password, phone });
    persist(response.data.token, response.data.user);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    persist("", null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null;
    }

    const response = await API.get("/me");
    // Backend returns a ProfileResponse; keep user role/email in sync.
    const nextUser = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      phone: response.data.phone,
    };
    persist(token, nextUser);
    return response.data;
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, token, login, signup, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;