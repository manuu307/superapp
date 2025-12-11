"use client";

import { BusinessProvider } from '@/context/BusinessContext';
import React from 'react';
import { useParams } from 'next/navigation';

const { businessId } = useParams();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider businessId={businessId as string}>
      {children}
    </BusinessProvider>
  );
}
