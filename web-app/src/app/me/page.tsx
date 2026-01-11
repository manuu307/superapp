"use client";
import React from 'react';
import Me from '@/components/Me';
import { withProtectedRoute } from '../withProtectedRoute';

const MePage = () => {
  return <Me />;
};

export default withProtectedRoute(MePage);
