"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GalaxyCard from '@/components/GalaxyCard';
import { withProtectedRoute } from '../withProtectedRoute';
import { useRouter } from 'next/navigation';

interface Galaxy {
  _id: string;
  name: string;
  description: string;
  purpose: string;
  tags: string[];
}

const UniversePage = () => {
  const { user, token } = useAuth();

  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [filteredGalaxies, setFilteredGalaxies] = useState<Galaxy[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGalaxies = async () => {
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/galaxies`, {
            headers: { 'x-auth-token': token || '' }
          });
          if (res.ok) {
            const data = await res.json();
            setGalaxies(data);
            setFilteredGalaxies(data);
            const allTags = data.reduce((acc: string[], galaxy: { tags: any; }) => {
              return [...acc, ...galaxy.tags.filter((tag: any) => !acc.includes(tag))];
            }, []);
            setTags(allTags);
          } else {
            console.error('Failed to fetch galaxies');
          }
        } catch (error) {
          console.error('Error fetching galaxies:', error);
        }
      }
    };

    fetchGalaxies();
  }, [token]);

  const handleTagFilter = (tag: string | null) => {
    setActiveTag(tag);
    if (tag) {
      const filtered = galaxies.filter((galaxy) => galaxy.tags.includes(tag));
      setFilteredGalaxies(filtered);
    } else {
      setFilteredGalaxies(galaxies);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-300">Universe</h1>

          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold">My Universe</h4>
            <button 
              onClick={() => router.push('/galaxy/new')}
              className="px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700"
            >
              + Create New Universe
            </button>
          </div>
        
        <div className="mb-8">
          <button 
            onClick={() => handleTagFilter(null)}
            className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTag === null ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGalaxies.map((galaxy) => (
            <GalaxyCard key={galaxy._id} galaxy={galaxy} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default withProtectedRoute(UniversePage);
