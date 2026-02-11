import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  employee_id: string | null;
  is_active: boolean;
}

interface EmployeeData {
  id: string;
  name: string;
  email: string | null;
  position: string | null;
  department: string | null;
  company_id: string | null;
  photo_url: string | null;
  employee_id: string;
}

interface AuthState {
  user: UserData | null;
  employee: EmployeeData | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'pjm_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    employee: null,
    sessionToken: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          user: parsed.user,
          employee: parsed.employee,
          sessionToken: parsed.session_token,
          isAuthenticated: true,
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login gagal');
    }

    const authData = {
      user: data.user,
      employee: data.employee,
      session_token: data.session_token,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    setState({
      user: data.user,
      employee: data.employee,
      sessionToken: data.session_token,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      employee: null,
      sessionToken: null,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
