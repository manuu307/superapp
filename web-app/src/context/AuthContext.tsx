"use client";
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface User {
  _id: string; // Assuming user has an ID
  username: string;
  email?: string;
  name?: string;
  lastname?: string;
  nickname?: string;
  tags?: string[];
  description?: string;
  website?: string;
  profilePicture?: string;
  rooms?: string[];
  catalog?: any[]; // Assuming catalog is an array of any for now, can be refined later
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (newToken: string) => void;
  logout: () => void;
  loading: boolean;
  refetchUser: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        // Use axios interceptor to set header
        axios.defaults.headers.common['x-auth-token'] = token;
        const { data } = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/auth/me`);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    fetchUser(); // Fetch user data immediately after login
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  const refetchUser = () => {
    fetchUser();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
