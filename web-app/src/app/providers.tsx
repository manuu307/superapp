"use client";

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SocialProvider } from '@/context/SocialContext';
import { BusinessProvider } from '@/context/BusinessContext';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocialProvider>
          <BusinessProvider>
            {children}
          </BusinessProvider>
        </SocialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
