"use client";
import React from 'react';
import { BusinessProvider } from '@/context/BusinessContext';
import Business from '@/components/Business';
import { withProtectedRoute } from '../withProtectedRoute';

const BusinessPage = () => {
  return (
    <BusinessProvider>
      <Business />
    </BusinessProvider>
  );
};

export default withProtectedRoute(BusinessPage);
