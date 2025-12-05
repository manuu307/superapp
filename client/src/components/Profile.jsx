import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileMainContent from './ProfileMainContent';

const Profile = ({ user, token, onProfileUpdate, onContactsUpdate }) => {
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-view-container">
      <ProfileSidebar user={user} token={token} onProfileUpdate={onProfileUpdate} />
      <ProfileMainContent user={user} token={token} onContactsUpdate={onContactsUpdate} />
    </div>
  );
};

export default Profile;