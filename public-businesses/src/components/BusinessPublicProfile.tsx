'use client';

import { useBusiness } from '@/context/BusinessContext';
import React, { useState, useEffect } from 'react';


interface Product {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  categories: string[];
}

const BusinessPublicProfile = (props:any) => {
  const {businessData, loading} = useBusiness()
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = activeCategory
    ? businessData?.products.filter(product => product.categories.includes(activeCategory))
    : businessData?.products;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!businessData) {
    return <div>Business not found</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="relative">
        <img
          src={businessData.bannerMedia || 'https://via.placeholder.com/1200x400'}
          alt={`${businessData.name} banner`}
          className="w-full h-64 object-cover rounded-t-lg"
        />
        <img
          src={businessData.picture || 'https://via.placeholder.com/150'}
          alt={businessData.name}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
        />
      </div>
      <div className="pt-16 text-center">
        <h1 className="text-4xl font-bold">{businessData.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{businessData.aboutUs}</p>
      </div>

      <div className="flex justify-center space-x-2 my-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-md ${!activeCategory ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-md ${activeCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts?.map(product => (
          <div key={product._id} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <img src={product.picture} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{product.short_description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold">
                <span className="text-gray-500 line-through">${product.price_before.toFixed(2)}</span> ${product.price_after.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPublicProfile;
