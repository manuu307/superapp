"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface AuthContextType {
  token: string | null;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  // Add other product fields as needed
}

interface BusinessData {
  _id: string;
  name: string;
  products: Product[];
  // Add other business fields as needed
}

interface BusinessContextType {
  businessData: BusinessData | null;
  loading: boolean;
  error: string | null;
  fetchBusinessData: () => Promise<void>;
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
 const { token, } = useContext(AuthContext) as AuthContextType;  
 const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessData = async () => {
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/business', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching business data: ${response.statusText}`);
      }
      const data = await response.json();
      setBusinessData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [token]); // Re-fetch if token changes

  return (
    <BusinessContext.Provider value={{ businessData, loading, error, fetchBusinessData }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export { BusinessContext, BusinessProvider };
