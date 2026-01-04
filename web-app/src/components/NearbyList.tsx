"use client";
import React, { useState, useCallback } from 'react';

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Radius: {radius} km
          </label>
          <input
            id="radius-slider"
            type="range"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <button
          onClick={findNearby}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {loading ? 'Searching...' : "Find Near Me"}
        </button>
      </div>

      {error && (
        <div className="text-center p-4 mb-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Fetching your location and searching...</p>
        </div>
      )}

      {!loading && !error && entities.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Click "Find Near Me" to discover what's around you.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div key={entity._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <img
                  src={entity.profilePicture || 'https://via.placeholder.com/50'}
                  alt={entity.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{entity.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Distance:</span>
                  <span className="font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">{entity.dist.calculated.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Energy Rank:</span>
                  <span className="font-mono px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">{entity.score.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Energy Balance:</span>
                  <span className="font-mono px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">{entity.energyBalance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyList;
