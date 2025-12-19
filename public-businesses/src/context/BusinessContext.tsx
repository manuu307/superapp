"use client";
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

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

interface BusinessData {
  business: Business | null;
  products: Product[];
}

interface Business {
  _id: string;
  name: string;
  picture?: string;
  bannerMedia?: string;
  aboutUs?: string;
  deliveryAvailable?: boolean;
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
  businessData: BusinessData | null;
  loading: boolean;
  error: string | null;
  categories: string[];
  activeCategory: string | null;
  filteredProducts: Product[] | undefined;
  fetchBusinessData: () => Promise<void>;
  setActiveCategory: (category: string | null) => void;
  resetCategoryFilter: () => void;
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
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const fetchBusinessData = async () => {
    if (!businessId) {
      setError('Business ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/public/stores/${businessId}`);
      if (!response.ok) {
        throw new Error(`Error fetching business data: ${response.statusText}`);
      }
      const data: BusinessData = await response.json();
      setBusinessData(data);
      console.log(data)


      // Extract unique categories from products
      if (data.products && data.products.length > 0) {
        const allCategories = data.products.reduce((acc: string[], product: Product) => {
          return [...acc, ...product.categories];
        }, []);
        const uniqueCategories = [...new Set(allCategories)];
        setCategories(uniqueCategories);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute filtered products based on active category
  const filteredProducts = useMemo(() => {
    if (!businessData?.products) return undefined;
    
    if (activeCategory) {
      return businessData.products.filter(product => 
        product.categories.includes(activeCategory)
      );
    }
    
    return businessData.products;
  }, [businessData, activeCategory]);

  const resetCategoryFilter = () => {
    setActiveCategory(null);
  };

  useEffect(() => {
    if (businessId) {
      fetchBusinessData();
    } else {
      setLoading(false);
      setError('No business ID provided');
    }
  }, [businessId]); // Re-fetch when businessId changes

  const value: BusinessContextType = {
    businessData,
    loading,
    error,
    categories,
    activeCategory,
    filteredProducts,
    fetchBusinessData,
    setActiveCategory,
    resetCategoryFilter
  };

  return (
    <BusinessContext.Provider value={value}>
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