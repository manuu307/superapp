import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';

interface Galaxy {
  _id: string;
  name: string;
  description: string;
  purpose: string;
  tags: string[];
}

const GalaxyCard = ({ galaxy }: { galaxy: Galaxy }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/galaxy/${galaxy._id}`);
  };

  return (
    <div className={"rounded-lg shadow-md p-4 flex flex-col justify-between dark:bg-gray-800"}>
      <div>
        <h2 className="text-xl font-bold mb-2">{galaxy.name}</h2>
        <p className="text-sm mb-2">{galaxy.description}</p>
        <p className="text-sm font-semibold mb-2">Purpose:</p>
        <p className="text-sm mb-4">{galaxy.purpose}</p>
      
        <div className="flex flex-wrap mb-4">
          {galaxy.tags.map(tag => (
            <span key={tag} className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleEdit}
          className="px-4 py-2 font-bold text-white bg-yellow-500 rounded-md hover:bg-yellow-700"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default GalaxyCard;
