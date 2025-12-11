"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { BusinessProvider } from '../../../context/BusinessContext';
import Navbar from '../../../components/Navbar';

interface StoreLayoutClientProps {
  children: React.ReactNode;
  businessId: string;
}

const StoreLayoutClient = ({ children, businessId }: StoreLayoutClientProps) => {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <BusinessProvider businessId={businessId}>
      <Navbar />
      <div>
        <nav className="flex justify-center space-x-4">
          <Link href={`/stores/${businessId}`} onClick={() => handleTabClick('Home')} className={`cursor-pointer ${activeTab === 'Home' ? 'border-b-2 border-blue-500' : ''}`}>
            Home
          </Link>
          <Link href={`/stores/${businessId}/about`} onClick={() => handleTabClick('About')} className={`cursor-pointer ${activeTab === 'About' ? 'border-b-2 border-blue-500' : ''}`}>
            About Us
          </Link>
          <Link href={`/stores/${businessId}/contact`} onClick={() => handleTabClick('Contact')} className={`cursor-pointer ${activeTab === 'Contact' ? 'border-b-2 border-blue-500' : ''}`}>
            Contact
          </Link>
        </nav>
        <main>{children}</main>
      </div>
    </BusinessProvider>
  );
};

export default StoreLayoutClient;
