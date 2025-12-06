import React, { useState } from 'react';

const Catalog = ({ catalog, token, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    media: null,
    mediaType: 'image'
  });

  const handleFileChange = (e) => {
    setNewItem({ ...newItem, media: e.target.files[0] });
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await fetch(`/api/users/catalog/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const { title, description, media, mediaType } = newItem;

    const uploadFormData = new FormData();
    uploadFormData.append('file', media);

    try {
      const uploadRes = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        throw new Error('File upload failed');
      }

      const { url } = await uploadRes.json();

      const catalogData = {
        title,
        description,
        mediaUrl: url,
        mediaType
      };

      const urlEndpoint = currentItem ? `/api/users/catalog/${currentItem._id}` : '/api/users/catalog';
      const method = currentItem ? 'PUT' : 'POST';

      const res = await fetch(urlEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(catalogData)
      });

      if (!res.ok) {
        throw new Error('Failed to save catalog item');
      }

      onUpdate();
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentItem(null);
    setNewItem({
      title: '',
      description: '',
      media: null,
      mediaType: 'image'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold">Catalog</h4>
        <button onClick={handleAddItem} className="px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700">Add Item</button>
      </div>
      <div className="flex pb-4 space-x-4 overflow-x-auto">
        {catalog && catalog.map(item => (
          <div key={item._id} className="flex-shrink-0 w-64 p-4 bg-gray-200 rounded-lg shadow-md dark:bg-gray-700">
            <h5 className="mb-2 text-lg font-bold">{item.title}</h5>
            {item.mediaType === 'image' ? (
              <img src={item.mediaUrl} alt={item.title} className="object-cover w-full h-32 rounded-md" />
            ) : (
              <video src={item.mediaUrl} controls className="w-full h-32 rounded-md" />
            )}
            <p className="mt-2 text-sm">{item.description}</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => handleEditItem(item)} className="px-3 py-1 text-sm font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Edit</button>
              <button onClick={() => handleDeleteItem(item._id)} className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xl font-bold">{currentItem ? 'Edit Item' : 'Add Item'}</h5>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">&times;</button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              ></textarea>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                required={!currentItem}
                className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
              <select
                value={newItem.mediaType}
                onChange={(e) => setNewItem({ ...newItem, mediaType: e.target.value })}
                className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
