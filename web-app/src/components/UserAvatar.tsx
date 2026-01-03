import React from 'react';
import { Zap } from 'lucide-react';

interface UserAvatarProps {
  user: {
    profilePicture?: string;
    overChargeMode?: boolean;
    username?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const { profilePicture, overChargeMode, username } = user;

  return (
    <div className={`relative inline-block`}>
      <div
        className={`rounded-full ${sizeClasses[size]} bg-slate-700 flex items-center justify-center text-white font-bold text-xl ${overChargeMode ? 'energy-pulse' : ''}`}
        style={{
            boxShadow: overChargeMode ? '0 0 15px 5px rgba(59, 130, 246, 0.4)' : 'none'
        }}
        >
        {profilePicture ? (
          <img src={profilePicture} alt={username || 'User Avatar'} className="rounded-full w-full h-full object-cover" />
        ) : (
          <span>{username ? username.charAt(0).toUpperCase() : 'U'}</span>
        )}
      </div>
      {overChargeMode && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <Zap className="w-6 h-6 text-blue-400 animate-ping absolute" />
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
