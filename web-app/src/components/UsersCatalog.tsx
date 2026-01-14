"use client";
import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { AuthContext } from '../context/AuthContext';

interface CatalogItem {
  _id: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description: string;
}

interface User {
  username: string;
  catalog?: CatalogItem[]; // Assuming catalog is an optional array of CatalogItem
}

interface AuthContextType {
  user: User | null;
  // Add other AuthContext properties if they are used in this component
}

const UsersCatalog = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const openItemView = (item: CatalogItem) => {
    setSelectedItem(item);
  };

  const closeItemView = () => {
    setSelectedItem(null);
  };

  if (!user || !user.catalog || user.catalog.length === 0) {
    return <div className="text-center p-8">No catalog items.</div>;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-black dark:text-white p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-500 dark:text-blue-300">My Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {user.catalog.map((item: CatalogItem) => (
          <div key={item._id} onClick={() => openItemView(item)} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col cursor-pointer">
            <div className="p-6">
              <h4 className="text-lg font-bold text-blue-500 dark:text-blue-300">{item.title}</h4>
              {item.mediaType === 'image' && <Image src={item.mediaUrl} alt={item.title} width={400} height={300} className="w-full rounded-md mt-4" />}
              {item.mediaType === 'video' && <video src={item.mediaUrl} controls className="w-full rounded-md mt-4" />}
              <p className="text-gray-600 dark:text-slate-400 mt-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80 z-50" onClick={closeItemView}>
          <div className="p-8 m-4 space-y-4 overflow-auto bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-3xl max-h-3/4 text-black dark:text-white">
            <h2 className="text-3xl font-bold text-blue-500 dark:text-blue-300">{selectedItem.title}</h2>
            {selectedItem.mediaType === 'image' && <Image src={selectedItem.mediaUrl} alt={selectedItem.title} width={800} height={600} className="w-full rounded-md" />}
            {selectedItem.mediaType === 'video' && <video src={selectedItem.mediaUrl} controls className="w-full rounded-md" />}
            <p className="text-gray-600 dark:text-slate-400">{selectedItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCatalog;