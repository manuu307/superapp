import React, { useState, useEffect } from 'react';
import Product from './Product';
import Catalog from './Catalog';

const Business = () => {
  const [businesses, setBusinesses] = useState([]);
  const [name, setName] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const fetchBusinesses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/business', {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    setBusinesses(data);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleFileChange = (e) => {
    setPictureFile(e.target.files[0]);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let pictureUrl = '';

    if (pictureFile) {
      const formData = new FormData();
      formData.append('file', pictureFile);

      try {
        const uploadRes = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'x-auth-token': token
          },
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }

        const { url } = await uploadRes.json();
        pictureUrl = url;
      } catch (err) {
        console.error(err);
        return; // Stop if file upload fails
      }
    }

    await fetch('/api/business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ name, picture: pictureUrl })
    });
    setName('');
    setPictureFile(null);
    fetchBusinesses();
  };

  if (selectedBusiness) {
    return (
      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <button onClick={() => setSelectedBusiness(null)} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Back to Businesses</button>
        <div className="flex items-center space-x-4">
          <img src={selectedBusiness.picture || 'https://via.placeholder.com/150'} alt={selectedBusiness.name} className="w-24 h-24 rounded-full" />
          <h2 className="text-2xl font-bold">{selectedBusiness.name}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Product businessId={selectedBusiness._id} />
          <Catalog businessId={selectedBusiness._id} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold">My Businesses</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Business Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="business-picture">
            Business Picture
          </label>
          <input
            id="business-picture"
            type="file"
            onChange={handleFileChange}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Create Business</button>
      </form>
      <ul className="space-y-2">
        {businesses.map(business => (
          <li key={business._id} onClick={() => setSelectedBusiness(business)} className="flex items-center p-2 space-x-4 bg-gray-200 rounded-md cursor-pointer dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
            <img src={business.picture || 'https://via.placeholder.com/50'} alt={business.name} className="w-12 h-12 rounded-full" />
            <span>{business.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Business;