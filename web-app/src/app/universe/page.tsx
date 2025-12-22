"use client";

import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthContextType } from '@/context/AuthContext';
import GalaxyCard from '@/components/GalaxyCard';
import { ThemeContext }from '@/context/ThemeContext';
import { withProtectedRoute } from '../withProtectedRoute';

interface Galaxy {
  _id: string;
  name: string;
  description: string;
  purpose: string;
  tags: string[];
}

const UniversePage = () => {
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    return <div>Loading...</div>;
  }

  const { user, token } = authContext;
  const { theme } = themeContext;
  
  const [galaxies, setGalaxies] = useState([]);
  const [filteredGalaxies, setFilteredGalaxies] = useState([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalaxies = async () => {
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/galaxies`, {
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
      const filtered = galaxies.filter((galaxy: { tags: string | any[]; }) => galaxy.tags.includes(tag));
      setFilteredGalaxies(filtered);
    } else {
      setFilteredGalaxies(galaxies);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Universe</h1>
        
        <div className="mb-4">
          <button 
            onClick={() => handleTagFilter(null)}
            className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm font-semibold ${activeTag === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button 
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className={`mr-2 mb-2 px-4 py-2 rounded-full text-sm font-semibold ${activeTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGalaxies.map((galaxy: { _id: React.Key | null | undefined; }) => (
            <GalaxyCard key={galaxy._id} galaxy={galaxy as Galaxy} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default withProtectedRoute(UniversePage);
