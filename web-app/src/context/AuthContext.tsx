"use client";
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ProductItem {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  business: string;
  categories: string[];
}

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
  catalog?: ProductItem[]; // Assuming catalog is an array of any for now, can be refined later
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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const refetchUser = useCallback(async () => {
    if (token) {
      setLoading(true);
      try {
        axios.defaults.headers.common['x-auth-token'] = token;
        const { data } = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/auth/me`);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = (newToken: string) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
