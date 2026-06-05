import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import API_URL from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  googleLogin: (accessToken: string, refreshToken: string, user: User) => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gdh_user');
    const storedToken = localStorage.getItem('gdh_token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('gdh_user');
        localStorage.removeItem('gdh_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    // If admin OTP is required, return the data without setting user yet
    if (data.requiresOTP) {
      return data;
    }

    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('gdh_user', JSON.stringify(data.user));
    localStorage.setItem('gdh_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('gdh_refresh_token', data.refreshToken);
    }
    return data;
  };

  const register = async (userData: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    // Auto-login: if the backend returns tokens + user, set session immediately
    if (data.accessToken && data.user) {
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('gdh_user', JSON.stringify(data.user));
      localStorage.setItem('gdh_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('gdh_refresh_token', data.refreshToken);
      }
    } else {
      // Fallback: attempt login with the supplied credentials
      try {
        await login(userData.email, userData.password);
      } catch {
        // If auto-login fails, registration still succeeded
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gdh_user');
    localStorage.removeItem('gdh_token');
    localStorage.removeItem('gdh_refresh_token');
    // Clear current view so they return to home
    localStorage.removeItem('gdh_current_view');
  };

  const googleLogin = (accessToken: string, refreshToken: string, googleUser: User) => {
    setUser(googleUser);
    setToken(accessToken);
    localStorage.setItem('gdh_user', JSON.stringify(googleUser));
    localStorage.setItem('gdh_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('gdh_refresh_token', refreshToken);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('gdh_user', JSON.stringify(updatedUser));
  };

  // Wrapped fetch with automatic token refresh
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const targetUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    const headers = new Headers(options.headers || {});
    const activeToken = token || localStorage.getItem('gdh_token');

    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }

    const mergedOptions: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
    };

    let res = await fetch(targetUrl, mergedOptions);

    // Auto refresh token on 401
    if (res.status === 401) {
      const refreshToken = localStorage.getItem('gdh_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            setToken(newToken);
            localStorage.setItem('gdh_token', newToken);
            headers.set('Authorization', `Bearer ${newToken}`);
            res = await fetch(targetUrl, { credentials: 'include', ...options, headers });
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
    }

    return res;
  };

  const isAdmin =
    !!user &&
    ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER'].includes(user.role) &&
    !!user.otpVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        apiFetch,
        googleLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
