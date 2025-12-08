import React from 'react';
import { BusinessProvider } from '../context/BusinessContext';
import Business from '../components/Business';

const BusinessPage = () => {
  return (
    <BusinessProvider>
      <Business />
    </BusinessProvider>
  );
};

export default BusinessPage;
