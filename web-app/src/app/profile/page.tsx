"use client";
import React from 'react';
import Profile from '@/components/Profile';
import { withProtectedRoute } from '../withProtectedRoute';

const ProfilePage = () => {
  return <Profile />;
};

export default withProtectedRoute(ProfilePage);
