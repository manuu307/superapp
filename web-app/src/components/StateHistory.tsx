"use client";
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

interface State {
  _id: string;
  color: string;
  tags: string[];
  description: string;
  createdAt: string;
}

const StateHistory = () => {
  const { token } = useContext(AuthContext) as AuthContextType;
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [stats, setStats] = useState<any>(null);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/me/states`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (!res.ok) throw new Error('Failed to fetch states');
      const data = await res.json();
      setStates(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/me/stats?time_range=${timeRange}`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
      else console.error('An unknown error occurred');
    }
  };

  useEffect(() => {
    if (token) {
      fetchStates();
      fetchStats();
    }
  }, [token, timeRange]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800 mt-4">
      <h4 className="text-xl font-bold">State History</h4>
      <div className="flex justify-end space-x-2 mb-4">
        <button onClick={() => setTimeRange('all')} className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>All Time</button>
        <button onClick={() => setTimeRange('weekly')} className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Weekly</button>
        <button onClick={() => setTimeRange('monthly')} className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Monthly</button>
        <button onClick={() => setTimeRange('yearly')} className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Yearly</button>
      </div>

      {stats && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h5 className="font-bold mb-2">Stats ({timeRange})</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-semibold">Color Distribution</h6>
              <ul>
                {Object.entries(stats.colorDistribution).map(([color, count]) => (
                  <li key={color} style={{ color }}>{color}: {count as any}</li>
                ))}
              </ul>
            </div>
            <div>
              <h6 className="font-semibold">Balance</h6>
              <p>Positive: {stats.balance.positive}</p>
              <p>Negative: {stats.balance.negative}</p>
              <p>Neutral: {stats.balance.neutral}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {states.map(state => (
          <div key={state._id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: state.color }}></div>
              <div>
                <p className="font-bold">{new Date(state.createdAt).toLocaleString()}</p>
                <p>{state.description}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {state.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateHistory;