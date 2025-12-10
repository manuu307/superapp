"use client";
import React, { useContext, useState } from 'react';
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
    return <div>No catalog items.</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold">My Catalog</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {user.catalog.map((item: CatalogItem) => (
          <div key={item._id} onClick={() => openItemView(item)} className="p-4 space-y-2 bg-gray-200 rounded-lg shadow-md cursor-pointer dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
            <h4 className="text-lg font-bold">{item.title}</h4>
            {item.mediaType === 'image' && <img src={item.mediaUrl} alt={item.title} className="w-full rounded-md" />}
            {item.mediaType === 'video' && <video src={item.mediaUrl} controls className="w-full rounded-md" />}
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80" onClick={closeItemView}>
          <div className="p-8 m-4 space-y-4 overflow-auto bg-white rounded-lg shadow-md max-w-3xl max-h-3/4 dark:bg-gray-800">
            <h2 className="text-3xl font-bold">{selectedItem.title}</h2>
            {selectedItem.mediaType === 'image' && <img src={selectedItem.mediaUrl} alt={selectedItem.title} className="w-full rounded-md" />}
            {selectedItem.mediaType === 'video' && <video src={selectedItem.mediaUrl} controls className="w-full rounded-md" />}
            <p>{selectedItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCatalog;