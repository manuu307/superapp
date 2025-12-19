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
  categories: string[];
}

interface BusinessCatalogProps {
  businessId: string;
  products: ProductItem[];
  onProductsChange: () => void;
}

const BusinessCatalog = ({ businessId, products, onProductsChange }: BusinessCatalogProps) => {
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const openItemView = (item: ProductItem) => {
    setSelectedItem(item);
  };

  const closeItemView = () => {
    setSelectedItem(null);
  };

  const handleEdit = (product: ProductItem) => {
    setSelectedItem(null);
    setEditingProduct(product);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products/${productId}`, {
          method: 'DELETE',
          headers: { 'x--auth-token': token }
        });
        if (!res.ok) {
          throw new Error('Failed to delete product');
        }
        setSelectedItem(null);
        onProductsChange();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, product: ProductItem) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const short_description = formData.get('short_description') as string;
    const description = formData.get('description') as string;
    const price_before = parseFloat(formData.get('price_before') as string);
    const price_after = parseFloat(formData.get('price_after') as string);
    const categories = formData.get('categories') as string;
    const pictureFile = (e.currentTarget.elements.namedItem('picture') as HTMLInputElement).files?.[0];

    let picture = product.picture;

    if (pictureFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', pictureFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: uploadFormData,
        });
        if (!uploadRes.ok) throw new Error('File upload failed');
        const { url } = await uploadRes.json();
        picture = url;
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const updatedProductData = {
      name,
      short_description,
      description,
      price_before,
      price_after,
      picture,
      categories: categories.split(',').map(c => c.trim()),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updatedProductData),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updatedProduct = await res.json();
      setEditingProduct(null);
      onProductsChange();
    } catch (error) {
      console.error('Error updating product:', error);
    }
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">Categories:</span>
              {selectedItem.categories.map((category, index) => (
                <span key={index} className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full">{category}</span>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(selectedItem); }} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(selectedItem._id); }} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80">
          <div className="p-8 m-4 space-y-4 overflow-auto bg-white rounded-lg shadow-md max-w-3xl max-h-3/4 dark:bg-gray-800">
            <h2 className="text-3xl font-bold">Edit Product</h2>
            <form onSubmit={(e) => handleUpdate(e, editingProduct)} className="space-y-4">
              <input type="text" name="name" defaultValue={editingProduct.name} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <input type="text" name="short_description" defaultValue={editingProduct.short_description} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <textarea name="description" defaultValue={editingProduct.description} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <input type="number" name="price_before" defaultValue={editingProduct.price_before} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <input type="number" name="price_after" defaultValue={editingProduct.price_after} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <input
                type="text"
                name="categories"
                defaultValue={editingProduct.categories.join(', ')}
                className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Categories (comma-separated)"
              />
              <input type="file" name="picture" className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              <div className="flex space-x-4">
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="w-full px-4 py-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCatalog;