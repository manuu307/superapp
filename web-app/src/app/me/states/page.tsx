"use client";
import React, { useEffect, useState, useContext } from 'react';
import { UserState } from '../../../types';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';

const StateCard = ({ state }: { state: UserState }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: state.color }}
        />
        <span className="font-bold text-lg">{state.polarity}</span>
      </div>
      {state.description && <p>{state.description}</p>}
      {state.media?.url && (
        <img src={state.media.url} alt="State media" className="max-w-full rounded-lg" />
      )}
      <div className="flex flex-wrap gap-2">
        {state.tags?.map(tag => (
          <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        {new Date(state.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

const MyStatesPage = () => {
  const { token } = useContext(AuthContext) as AuthContextType;
  const [states, setStates] = useState<UserState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/me/states`, {
          headers: {
            'x-auth-token': token || ''
          }
        });
        const data = await res.json();
        setStates(data);
      } catch (error) {
        console.error('Failed to fetch user states:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStates();
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My States</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map(state => (
            <StateCard key={state._id} state={state} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStatesPage;
