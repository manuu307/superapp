import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileMainContent from './ProfileMainContent';

const Profile = ({ user, token, onProfileUpdate }) => {
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="flex h-full p-4 space-x-4 bg-gray-100 dark:bg-gray-900">
      <ProfileSidebar user={user} token={token} onProfileUpdate={onProfileUpdate} />
      <ProfileMainContent user={user} token={token} onProfileUpdate={onProfileUpdate} />
    </div>
  );
};

export default Profile;