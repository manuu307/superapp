import React, { useContext } from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileMainContent from './ProfileMainContent';
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

const Profile = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="flex h-full p-4 space-x-4 bg-gray-100 dark:bg-gray-900">
      <ProfileSidebar />
      <ProfileMainContent />
    </div>
  );
};

export default Profile;