"use client";
import React, { createContext } from 'react';

interface BusinessContextType {
  // Add business-related state and functions here
}

interface BusinessProviderProps {
  children: React.ReactNode;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  // Add business-related state and functions here

  return (
    <BusinessContext.Provider value={{}}>
      {children}
    </BusinessContext.Provider>
  );
};

export { BusinessContext, BusinessProvider };
