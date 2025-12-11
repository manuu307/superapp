"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Business } from '../types/Business';
import { Product } from '../types/Product';


interface BusinessContextType {
  business: Business | null;
  products: Product[];
  loading: boolean;
  error: string | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
  businessId: string;
}

export const BusinessProvider = ({ children, businessId }: BusinessProviderProps) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      const fetchBusiness = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/public/stores/${businessId}`);
          if (!res.ok) {
            throw new Error('Business not found');
          }
          const data = await res.json();
          setBusiness(data.business);
          setProducts(data.products);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchBusiness();
    }
  }, [businessId]);

  return (
    <BusinessContext.Provider value={{ business, products, loading, error }}>
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