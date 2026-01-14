"use client";
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import StateHistory from './StateHistory';
import StateEntryForm from './StateEntryForm';

const StateManager = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex p-4 flex-col gap-4 lg:flex-row">
      {/* LEFT COLUMN */}
      <div className="flex-1 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <StateEntryForm />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <StateHistory />
      </div>
    </div>
  );
};

export default StateManager;
