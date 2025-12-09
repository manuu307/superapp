"use client";
import React, { useState, useEffect } from 'react';

interface ProductItem {
  _id: string;
  name: string;
  short_description: string;
  description: string;
  picture: string;
  price_before: number;
  price_after: number;
  business: string;
}

interface BusinessCatalogProps {
  businessId: string;
}

const BusinessCatalog = ({ businessId }: BusinessCatalogProps) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${businessId}`, {
          headers: {
            'x-auth-token': token || '',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchProducts();
    }
  }, [businessId]);

  const openItemView = (item: ProductItem) => {
    setSelectedItem(item);
  };

  const closeItemView = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return <div>Loading catalog...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div>No products in catalog.</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold">Business Catalog</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((item) => (
          <div key={item._id} onClick={() => openItemView(item)} className="p-4 space-y-2 bg-gray-200 rounded-lg shadow-md cursor-pointer dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
            <h4 className="text-lg font-bold">{item.name}</h4>
            <img src={item.picture} alt={item.name} className="w-full rounded-md" />
            <p>{item.short_description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 line-through">${item.price_before}</span>
              <span className="text-lg font-bold text-green-600">${item.price_after}</span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCatalog;