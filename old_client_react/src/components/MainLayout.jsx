import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
