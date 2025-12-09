"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Product from './Product';
import BusinessCatalog from './BusinessCatalog';

interface BusinessItem {
  _id: string;
  name: string;
  picture?: string;
}

const Business = () => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [name, setName] = useState<string>('');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);

  const fetchBusinesses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where token is not available, e.g., redirect to login
      return;
    }
    try {
      const res = await fetch('/api/business', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch businesses');
      }
      const data: BusinessItem[] = await res.json();
      setBusinesses(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      // Optionally set an error state
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPictureFile(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where token is not available
      return;
    }
    let pictureUrl: string = '';

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
      } catch (err: any) {
        console.error(err);
        // Optionally set an error state
        return; // Stop if file upload fails
      }
    }

    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ name, picture: pictureUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create business');
      }

      setName('');
      setPictureFile(null);
      fetchBusinesses();
    } catch (err: any) {
      console.error(err);
      // Optionally set an error state
    }
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
          <BusinessCatalog businessId={selectedBusiness._id} />
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
        {businesses.map((business: BusinessItem) => (
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