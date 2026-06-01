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
  register: (userData: any) => Promise<void>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  googleLogin: (accessToken: string, refreshToken: string, user: User) => void;
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
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('gdh_user');
        localStorage.removeItem('gdh_token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login credentials invalid');
    }

    setUser(data.user);
    setToken(data.accessToken);

    localStorage.setItem('gdh_user', JSON.stringify(data.user));
    localStorage.setItem('gdh_token', data.accessToken);
    localStorage.setItem('gdh_refresh_token', data.refreshToken);

    return data.user;
  };

  const register = async (userData: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration details unacceptable');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('gdh_user');
    localStorage.removeItem('gdh_token');
    localStorage.removeItem('gdh_refresh_token');
  };

  const googleLogin = (
    accessToken: string,
    refreshToken: string,
    user: User
  ) => {
    setUser(user);
    setToken(accessToken);

    localStorage.setItem('gdh_user', JSON.stringify(user));
    localStorage.setItem('gdh_token', accessToken);
    localStorage.setItem('gdh_refresh_token', refreshToken);
  };

  const apiFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const targetUrl = url.startsWith('/')
      ? `${API_URL}${url}`
      : url;

    const headers = new Headers(options.headers || {});
    let activeToken = token || localStorage.getItem('gdh_token');

    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }

    let response = await fetch(targetUrl, {
      credentials: 'include',
      ...options,
      headers,
    });

    // Refresh token if access token expired
    if (
      (response.status === 401 || response.status === 403) &&
      localStorage.getItem('gdh_refresh_token')
    ) {
      try {
        const refreshResponse = await fetch(
          `${API_URL}/api/auth/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              refreshToken: localStorage.getItem('gdh_refresh_token'),
            }),
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          setToken(refreshData.accessToken);

          localStorage.setItem(
            'gdh_token',
            refreshData.accessToken
          );

          if (refreshData.refreshToken) {
            localStorage.setItem(
              'gdh_refresh_token',
              refreshData.refreshToken
            );
          }

          headers.set(
            'Authorization',
            `Bearer ${refreshData.accessToken}`
          );

          response = await fetch(targetUrl, {
            credentials: 'include',
            ...options,
            headers,
          });
        } else {
          logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin:
          !!user &&
          ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER'].includes(
            user.role
          ),
        isLoading,
        login,
        register,
        logout,
        apiFetch,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be called inside a AuthProvider wrapper'
    );
  }

  return context;
}
