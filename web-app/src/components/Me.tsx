import React, { useContext } from 'react';
import MeSidebar from './MeSidebar';
import MeMainContent from './MeMainContent';
import { AuthContext } from '../context/AuthContext';

interface User {
  username: string;
  name?: string;
  lastname?: string;
  nickname?: string;
  tags?: string[];
  description?: string;
  website?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  // Add other AuthContext properties if they are used in this component
}

const Me = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  if (!user) {
    return <div>Loading me...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full p-4 space-y-4 md:space-y-0 md:space-x-4 bg-gray-100 dark:bg-gray-900">
      <MeSidebar />
      <MeMainContent />
    </div>
  );
};

export default Me;