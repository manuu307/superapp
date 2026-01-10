import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Tag, ArrowRight } from 'lucide-react';

interface Galaxy {
  _id: string;
  name: string;
  description: string;
  purpose: string;
  tags: string[];
}

const GalaxyCard = ({ galaxy }: { galaxy: Galaxy }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/galaxy/${galaxy._id}`);
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold text-blue-300 mb-2">{galaxy.name}</h2>
        <p className="text-slate-400 mb-4 text-sm">{galaxy.description}</p>
        
        <div className="flex items-start mb-4">
          <Book className="w-4 h-4 mr-2 text-cyan-400 mt-1 flex-shrink-0"/>
          <div>
            <p className="text-sm font-semibold text-slate-300">Purpose:</p>
            <p className="text-slate-400 text-sm">{galaxy.purpose}</p>
          </div>
        </div>
      
        <div className="flex flex-wrap items-center">
          <Tag className="w-4 h-4 mr-2 text-green-400"/>
          {galaxy.tags.map(tag => (
            <span key={tag} className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs font-semibold mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto px-6 pb-6">
        <button 
          onClick={handleNavigate}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
        >
          View Details <ArrowRight className="w-4 h-4 ml-2"/>
        </button>
      </div>
    </div>
  );
};

export default GalaxyCard;
