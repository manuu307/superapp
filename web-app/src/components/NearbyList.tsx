"use client";
import React, { useState, useCallback } from 'react';
import { MapPin, Search, Sun, Wind } from 'lucide-react';

// Define the structure of a nearby entity based on the backend response
interface NearbyEntity {
  _id: string;
  name: string;
  energyBalance: number;
  dist: {
    calculated: number; // Distance in kilometers
  };
  score: number;
  profilePicture?: string;
}

const NearbyList = () => {
  const [entities, setEntities] = useState<NearbyEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default radius in km

  const findNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEntities([]);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api/v1/circles/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch nearby entities.');
          }

          const data = await response.json();
          setEntities(data.data);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred.');
          }
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}`);
        setLoading(false);
      }
    );
  }, [radius]);

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 p-6 bg-slate-800/50 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-grow w-full">
              <label htmlFor="radius-slider" className="block text-sm font-medium text-slate-300 mb-2">
                Search Radius: <span className="font-bold text-blue-300">{radius} km</span>
              </label>
              <input
                id="radius-slider"
                type="range"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-blue"
              />
            </div>
            <button
              onClick={findNearby}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <Search className="w-5 h-5 mr-2"/>
              {loading ? 'Searching...' : "Find Near Me"}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-center p-4 mb-4 text-red-300 bg-red-900/50 border border-red-500 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Fetching your location and searching...</p>
          </div>
        )}

        {!loading && !error && entities.length === 0 && (
          <div className="text-center text-slate-500 p-8 bg-slate-800/50 rounded-xl">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-600"/>
            <p>Click "Find Near Me" to discover what's around you.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <div key={entity._id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <img
                    src={entity.profilePicture || 'https://i.pravatar.cc/150?u=' + entity._id}
                    alt={entity.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-slate-700"
                  />
                  <h3 className="text-xl font-bold text-blue-300 truncate">{entity.name}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400 flex items-center"><MapPin className="w-4 h-4 mr-2"/>Distance:</span>
                    <span className="font-mono px-2 py-1 bg-slate-700 text-slate-300 rounded-md">{entity.dist.calculated.toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400 flex items-center"><Sun className="w-4 h-4 mr-2"/>Energy Rank:</span>
                    <span className="font-mono px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md">{entity.score.toFixed(2)}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400 flex items-center"><Wind className="w-4 h-4 mr-2"/>Energy Balance:</span>
                    <span className="font-mono px-2 py-1 bg-green-900/50 text-green-300 rounded-md">{entity.energyBalance}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyList;
