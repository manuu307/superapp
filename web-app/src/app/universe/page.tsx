"use client";

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import GalaxyCard from '@/components/GalaxyCard';
import { ThemeContext }from '@/context/ThemeContext';

// Mock galaxy data for testing
const mockGalaxies = [
    {
        _id: "1",
        name: "Milky Way",
        description: "The galaxy containing our Solar System.",
        purpose: "To explore and understand our cosmic neighborhood.",
        tags: ["home", "spiral", "barred"],
        admins: [],
        managers: [],
        participants: [],
        guests: [],
        watchers: [],
        rooms: []
    },
    {
        _id: "2",
        name: "Andromeda",
        description: "The nearest major galaxy to the Milky Way.",
        purpose: "To study galactic evolution and collision.",
        tags: ["spiral", "neighbor", "collision-course"],
        admins: [],
        managers: [],
        participants: [],
        guests: [],
        watchers: [],
        rooms: []
    },
    {
        _id: "3",
        name: "Triangulum",
        description: "The third-largest member of the Local Group.",
        purpose: "To observe star formation in a smaller galaxy.",
        tags: ["spiral", "local-group", "star-formation"],
        admins: [],
        managers: [],
        participants: [],
        guests: [],
        watchers: [],
        rooms: []
    },
    {
        _id: "4",
        name: "Whirlpool",
        description: "A classic spiral galaxy with well-defined arms.",
        purpose: "To admire the beauty of galactic structure.",
        tags: ["spiral", "grand-design", "interacting"],
        admins: [],
        managers: [],
        participants: [],
        guests: [],
        watchers: [],
        rooms: []
    }
];

const UniversePage = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [galaxies, setGalaxies] = useState([]);
  const [filteredGalaxies, setFilteredGalaxies] = useState([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalaxies = async () => {
      if (token) {
        try {
            /*
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/galaxies`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setGalaxies(data);
            setFilteredGalaxies(data);
            const allTags = data.reduce((acc, galaxy) => {
              return [...acc, ...galaxy.tags.filter(tag => !acc.includes(tag))];
            }, []);
            setTags(allTags);
          } else {
            console.error('Failed to fetch galaxies');
          }
          */
            setGalaxies(mockGalaxies);
            setFilteredGalaxies(mockGalaxies);
            const allTags = mockGalaxies.reduce((acc, galaxy) => {
                return [...acc, ...galaxy.tags.filter(tag => !acc.includes(tag))];
            }, []);
            setTags(allTags);
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
      const filtered = galaxies.filter(galaxy => galaxy.tags.includes(tag));
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
          {filteredGalaxies.map(galaxy => (
            <GalaxyCard key={galaxy._id} galaxy={galaxy} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversePage;
