"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';

interface Product {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  categories: string[];
}

interface Business {
  _id: string;
  name: string;
  picture?: string;
  bannerMedia?: string;
  aboutUs?: string;
  deliveryAvailable?: boolean;
  products: Product[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  openDaysHours?: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
}

interface BusinessContextType {
  businessData: Business | null;
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
  const [businessData, setBusinessData] = useState<Business | null>(null);
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
  }, []); // Re-fetch if token changes

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
