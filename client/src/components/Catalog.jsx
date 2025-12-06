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
    <div className="catalog-section">
      <h4>Catalog</h4>
      <button onClick={handleAddItem}>Add Item</button>
      <div className="catalog-carousel">
        {catalog && catalog.map(item => (
          <div key={item._id} className="catalog-card">
            <h5>{item.title}</h5>
            {item.mediaType === 'image' ? (
              <img src={item.mediaUrl} alt={item.title} />
            ) : (
              <video src={item.mediaUrl} controls />
            )}
            <p>{item.description}</p>
            <button onClick={() => handleEditItem(item)}>Edit</button>
            <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
          </div>
        ))}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <form onSubmit={handleSaveItem}>
              <input
                type="text"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              ></textarea>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                required={!currentItem}
              />
              <select
                value={newItem.mediaType}
                onChange={(e) => setNewItem({ ...newItem, mediaType: e.target.value })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
