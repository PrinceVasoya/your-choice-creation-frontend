import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  error: string | null;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('ecommerce_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.token) {
          localStorage.setItem('token', u.token);
        }
        return u;
      } catch (e) {
        localStorage.removeItem('ecommerce_user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded) && result.data) {
        const authData = result.data;
        const loggedInUser: AuthUser = {
          id: authData.user.id,
          name: authData.user.fullName,
          email: authData.user.email,
          token: authData.accessToken,
          roles: authData.user.roles || [],
        };
        setUser(loggedInUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', authData.accessToken);
        return { success: true };
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Login failed. Please check your credentials.');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = 'Connection error. Is the backend server running?';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0] || 'First';
      const lastName = parts.slice(1).join(' ') || 'Last';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: '1234567890' // Default placeholder
        }),
      });

      const result = await response.json();

      if (response.ok && (result.success || result.succeeded) && result.data) {
        const authData = result.data;
        const loggedInUser: AuthUser = {
          id: authData.user.id,
          name: authData.user.fullName,
          email: authData.user.email,
          token: authData.accessToken,
          roles: authData.user.roles || [],
        };
        setUser(loggedInUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', authData.accessToken);
        return { success: true };
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors.map((e: any) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ')
          : (result.message || 'Registration failed.');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = 'Connection error. Is the backend server running?';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('ecommerce_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, register, logout, error, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
