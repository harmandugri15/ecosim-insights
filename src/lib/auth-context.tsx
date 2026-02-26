import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "admin" | "analyst" | "viewer" | "org_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@ecosim.io": {
    password: "admin123",
    user: { id: "u1", name: "Alex Rivera", email: "admin@ecosim.io", role: "admin", organization: "EcoSim Corp", avatar: "AR" },
  },
  "analyst@ecosim.io": {
    password: "analyst123",
    user: { id: "u2", name: "Sam Chen", email: "analyst@ecosim.io", role: "analyst", organization: "GreenTech Labs", avatar: "SC" },
  },
  "demo@ecosim.io": {
    password: "demo123",
    user: { id: "u3", name: "Demo User", email: "demo@ecosim.io", role: "viewer", avatar: "DU" },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("ecosim_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    const entry = DEMO_USERS[email.toLowerCase()];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem("ecosim_user", JSON.stringify(entry.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ecosim_user");
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string, role: UserRole = "viewer"): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    };
    setUser(newUser);
    localStorage.setItem("ecosim_user", JSON.stringify(newUser));
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
