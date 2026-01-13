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
    <div className="flex p-4 flex-col gap-4 lg:flex-row">
      {/* LEFT COLUMN */}
      <div className="flex-1 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <MeSidebar />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <MeMainContent />
      </div>
    </div>
  );
};

export default Me;