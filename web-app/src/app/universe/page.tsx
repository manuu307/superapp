"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { UserState } from '../../types';

const StateCard = ({ state }: { state: UserState }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: state.color }}
        />
        <span className="font-bold text-lg">{state.polarity}</span>
        <span className="text-sm text-gray-500">by {state.user?.name || 'Anonymous'}</span>
      </div>
      {state.media?.url && (
        <img src={state.media.url} alt="State media" className="max-w-full rounded-lg" />
      )}
      {state.description && <p>{state.description}</p>}
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

const PAGE_SIZE = 10;

const UniversePage = () => {
  const [states, setStates] = useState<UserState[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Prevent duplicate fetches (React Strict Mode)
  const didFetch = useRef<boolean>(false);

  // Track already fetched state IDs
  const fetchedIds = useRef<Set<string>>(new Set());

  const fetchStates = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_PATH}/universe/states?page=${page}&limit=${PAGE_SIZE}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch universe states");
      }

      const newStates: UserState[] = await res.json();

      // Deduplicate by _id
      const uniqueStates = newStates.filter((state) => {
        if (fetchedIds.current.has(state._id)) return false;
        fetchedIds.current.add(state._id);
        return true;
      });

      setStates((prev) => [...prev, ...uniqueStates]);

      if (newStates.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch universe states:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  // Initial fetch (Strict Mode safe)
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchStates();
  }, [fetchStates]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Universe</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {states.map((state) => (
          <StateCard key={state._id} state={state} />
        ))}
      </div>

      {loading && (
        <p className="text-center mt-4 text-gray-500">Loading...</p>
      )}

      {!loading && hasMore && (
        <button
          onClick={fetchStates}
          className="w-full mt-6 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          Load More
        </button>
      )}

      {!hasMore && !loading && (
        <p className="text-center mt-6 text-gray-400">
          You have reached the end.
        </p>
      )}
    </div>
  );
};

export default UniversePage;