"use client";
import SocialGridView from '@/components/SocialGridView';
import { withProtectedRoute } from '@/app/withProtectedRoute';
import React from 'react';

const SocialGridPage = () => {
  return (
    <SocialGridView />
  );
};

export default withProtectedRoute(SocialGridPage);