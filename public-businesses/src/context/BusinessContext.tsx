"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';

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
  businessId: string | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const BusinessProvider: React.FC<BusinessProviderProps> = ({ children, businessId }) => {
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/public/stores/${businessId}`);
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
  }, [businessId]); // Re-fetch if token changes

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
