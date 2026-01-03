'use client';

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { Users, Map, Droplet } from 'lucide-react';

// Mock data for circles until the API is fully integrated
const mockCircles = [
  {
    _id: '1',
    name: 'Eco Warriors',
    description: 'A group dedicated to local cleanup and green initiatives.',
    members: [
      { _id: 'a', username: 'Alice', overChargeMode: true, profilePicture: 'https://i.pravatar.cc/150?u=a' },
      { _id: 'b', username: 'Bob', overChargeMode: false, profilePicture: 'https://i.pravatar.cc/150?u=b' },
    ],
    location: { coordinates: [-74.006, 40.7128] },
    entryFee: 10,
    vault: 1500,
  },
  {
    _id: '2',
    name: 'Solar Innovators',
    description: 'Developing and sharing open-source solar panel designs.',
    members: [
        { _id: 'c', username: 'Charlie', overChargeMode: false, profilePicture: 'https://i.pravatar.cc/150?u=c' },
        { _id: 'd', username: 'Diana', overChargeMode: true, profilePicture: 'https://i.pravatar.cc/150?u=d' },
        { _id: 'e', username: 'Eve', overChargeMode: false, profilePicture: 'https://i.pravatar.cc/150?u=e' },
    ],
    location: { coordinates: [-118.2437, 34.0522] },
    entryFee: 25,
    vault: 8300,
  },
];


const SocialGridView = () => {
  const [circles, setCircles] = useState(mockCircles);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCircles = async () => {
      if (!token) {
        setLoading(false);
        return;
      };
      try {
        // We start with mock data, but here is where the API call would go.
        // const response = await axios.get('/api/v1/circles', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setCircles(response.data);
        setCircles(mockCircles); // Using mock data for now
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch circles.');
        setLoading(false);
      }
    };

    fetchCircles();
  }, [token]);

  const handleJoinCircle = async (circleId: string) => {
    if (!token) {
      alert('You must be logged in to join a circle.');
      return;
    }
    try {
      const response = await axios.post(`/api/v1/circles/${circleId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update the state to reflect the change
      setCircles(circles.map(c => c._id === circleId ? response.data : c));
      alert('Successfully joined the circle!');
    } catch (err: any) {
      alert(`Failed to join circle: ${err.response?.data?.msg || 'Server error'}`);
    }
  };

  if (loading) return <div className="text-center p-8">Loading Social Grid...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-300">Nexus Circles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Synergy Map Placeholder */}
        <div className="lg:col-span-2 xl:col-span-1 rounded-xl bg-slate-800/50 p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Map className="w-16 h-16 text-blue-400 mb-4"/>
            <h3 className="text-2xl font-bold text-slate-300">Synergy Map</h3>
            <p className="text-slate-400 text-center">Visualizing the connections between circles.</p>
        </div>

        {circles.map(circle => (
          <div key={circle._id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-300 mb-2">{circle.name}</h2>
              <p className="text-slate-400 mb-4">{circle.description}</p>
              
              <div className="flex items-center justify-between text-sm mb-4 text-slate-300">
                <div className="flex items-center">
                    <Droplet className="w-4 h-4 mr-2 text-cyan-400"/>
                    <span>Live Energy: <span className="font-bold text-cyan-300">{circle.vault.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-green-400"/>
                    <span>{circle.members.length} Members</span>
                </div>
              </div>

              <div className="flex -space-x-4 mb-6">
                {circle.members.slice(0, 5).map(member => (
                  <UserAvatar key={member._id} user={member} size="sm" />
                ))}
                {circle.members.length > 5 && (
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold z-10">
                        +{circle.members.length - 5}
                    </div>
                )}
              </div>

            </div>
            <div className="mt-auto px-6 pb-6">
                <button 
                    onClick={() => handleJoinCircle(circle._id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                >
                    Join ({circle.entryFee} Lumens)
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialGridView;
