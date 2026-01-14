"use client";
import React, { useState } from 'react';

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
  products: ProductItem[];
  onProductsChange: () => void;
}

const BusinessCatalog = ({ products, onProductsChange }: BusinessCatalogProps) => {
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

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
          headers: { 'x-auth-token': token }
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
      await res.json();
      setEditingProduct(null);
      onProductsChange();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (products.length === 0) {
    return <div className="text-center p-8">No products in catalog.</div>;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-300">Business Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div key={item._id} onClick={() => openItemView(item)} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col cursor-pointer">
            <div className="p-6">
              <h4 className="text-lg font-bold text-blue-300">{item.name}</h4>
              <img src={item.picture} alt={item.name} width={400} height={300} className="w-full rounded-md mt-4" />
              <p className="text-slate-400 mt-2">{item.short_description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500 line-through">${item.price_before}</span>
                <span className="text-lg font-bold text-green-400">${item.price_after}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80 z-50" onClick={closeItemView}>
          <div className="p-8 m-4 space-y-4 overflow-auto bg-slate-800 rounded-lg shadow-md max-w-3xl max-h-3/4 text-white">
            <h2 className="text-3xl font-bold text-blue-300">{selectedItem.name}</h2>
            <img src={selectedItem.picture} alt={selectedItem.name} width={800} height={600} className="w-full rounded-md" />
            <p className="text-lg text-slate-300">{selectedItem.short_description}</p>
            <p className="text-slate-400">{selectedItem.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-slate-500 line-through">${selectedItem.price_before}</span>
              <span className="text-2xl font-bold text-green-400">${selectedItem.price_after}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-300">Categories:</span>
              {selectedItem.categories.map((category, index) => (
                <span key={index} className="px-2 py-1 text-sm text-white bg-blue-600 rounded-full">{category}</span>
              ))}
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(selectedItem); }} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(selectedItem._id); }} className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-80 z-50">
          <div className="p-8 m-4 space-y-4 overflow-auto bg-slate-800 rounded-lg shadow-md max-w-3xl max-h-3/4 text-white">
            <h2 className="text-3xl font-bold text-blue-300">Edit Product</h2>
            <form onSubmit={(e) => handleUpdate(e, editingProduct)} className="space-y-4">
              <input type="text" name="name" defaultValue={editingProduct.name} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="short_description" defaultValue={editingProduct.short_description} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea name="description" defaultValue={editingProduct.description} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" name="price_before" defaultValue={editingProduct.price_before} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" name="price_after" defaultValue={editingProduct.price_after} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input
                type="text"
                name="categories"
                defaultValue={editingProduct.categories.join(', ')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Categories (comma-separated)"
              />
              <input type="file" name="picture" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex space-x-4">
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500">Save</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="w-full px-4 py-2 font-bold text-white bg-slate-600 rounded-md hover:bg-slate-500">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCatalog;