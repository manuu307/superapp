import React, { createContext } from 'react';

const BusinessContext = createContext();

const BusinessProvider = ({ children }) => {
  // Add business-related state and functions here

  return (
    <BusinessContext.Provider value={{}}>
      {children}
    </BusinessContext.Provider>
  );
};

export { BusinessContext, BusinessProvider };
