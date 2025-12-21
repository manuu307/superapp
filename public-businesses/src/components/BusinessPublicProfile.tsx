'use client';

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

interface Business {
  _id: string;
  name: string;
  picture?: string;
  bannerMedia?: string;
  aboutUs?: string;
  deliveryAvailable?: boolean;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  openDaysHours?: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
}

interface ProductItem {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  categories: string[];
}

import BusinessChatWidget from './BusinessChatWidget';

const BusinessPublicProfile = ({ businessId }: { businessId: string }) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);

  const openItemView = (item: ProductItem) => {
    setSelectedItem(item);
  };

  const closeItemView = () => {
    setSelectedItem(null);
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/public/stores/${businessId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch business data');
        }
        const { business, products }: { business: Business; products: Product[] } = await res.json();
        setBusiness(business);
        setProducts(products);
        console.log(business)

        const allCategories = products.reduce((acc: string[], product: Product) => {
          return [...acc, ...product.categories];
        }, []);
        const uniqueCategories = [...new Set(allCategories)];
        setCategories(uniqueCategories);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const filteredProducts = activeCategory
    ? products.filter(product => product.categories.includes(activeCategory))
    : products;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!business) {
    return <div>Business not found</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="relative">
        <img
          src={business.bannerMedia || 'https://via.placeholder.com/1200x400'}
          alt={`${business.name} banner`}
          className="w-full h-64 object-cover rounded-t-lg"
        />
        <img
          src={business.picture || 'https://via.placeholder.com/150'}
          alt={business.name}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
        />
      </div>
      <div className="pt-16 text-center">
        <h1 className="text-4xl font-bold">{business.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{business.aboutUs}</p>
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
        {filteredProducts.map(product => (
          <div onClick={() => openItemView(product)} key={product._id} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
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

      {selectedItem && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80" onClick={closeItemView}>
          <div className="p-8 m-4 space-y-4 overflow-auto bg-white rounded-lg shadow-md max-w-3xl max-h-3/4 dark:bg-gray-800">
            <h2 className="text-3xl font-bold">{selectedItem.name}</h2>
            <img src={selectedItem.picture} alt={selectedItem.name} className="w-full rounded-md" />
            <p className="text-lg">{selectedItem.short_description}</p>
            <p>{selectedItem.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-500 line-through">${selectedItem.price_before}</span>
              <span className="text-2xl font-bold text-green-600">${selectedItem.price_after}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Categories:</span>
              {selectedItem.categories.map((category, index) => (
                <span key={index} className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full">{category}</span>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Comprar</button>
            </div>
          </div>
        </div>
      )}
      <BusinessChatWidget businessId={businessId} enabled={true} />
    </div>
  );
};

export default BusinessPublicProfile;
