import React, { useContext } from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileMainContent from './ProfileMainContent';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

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