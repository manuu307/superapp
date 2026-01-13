"use client";
import { withProtectedRoute } from '../withProtectedRoute';
import StateManager from '@/components/StateManager';

const MePage = () => {
  return <StateManager />;
};

export default withProtectedRoute(MePage);
