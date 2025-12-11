"use client";
import React, { useState, useEffect, useCallback } from 'react';

interface ProductItem {

  _id: string;

  name: string;

  short_description: string;

  description: string;

  picture: string;

  price_before: number;

  price_after: number;

  businessId: string;

  categories: string[];

}



interface ProductProps {

  businessId: string;

  onProductsChange: () => void;

}



const Product: React.FC<ProductProps> = ({ businessId, onProductsChange }) => {

  const [name, setName] = useState<string>('');

  const [shortDescription, setShortDescription] = useState<string>('');

  const [description, setDescription] = useState<string>('');

  const [pictureFile, setPictureFile] = useState<File | null>(null);

  const [price_before, setPriceBefore] = useState<string>('');

  const [price_after, setPriceAfter] = useState<string>('');

  const [categories, setCategories] = useState<string>('');

  const [error, setError] = useState<string>('');

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files.length > 0) {

      setPictureFile(e.target.files[0]);

    }

  };

  

  const handleEdit = (product: ProductItem) => {

    setEditingProduct(product);

    setName(product.name);

    setShortDescription(product.short_description);

    setDescription(product.description);

    setPriceBefore(product.price_before.toString());

    setPriceAfter(product.price_after.toString());

    setCategories(product.categories.join(','));

    setPictureFile(null);

  };



  const handleDelete = async (productId: string) => {

    if (window.confirm('Are you sure you want to delete this product?')) {

      const token = localStorage.getItem('token');

      if (!token) {

        setError('Authentication token not found. Please log in.');

        return;

      }

      try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products/${productId}`, {

          method: 'DELETE',

          headers: { 'x-auth-token': token }

        });

        if (!res.ok) {

          throw new Error('Failed to delete product');

        }

        onProductsChange();

      } catch (error: any) {

        console.error('Error deleting product:', error);

        setError(error.message || 'Failed to delete product.');

      }

    }

  };



  const handleUpdate = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!editingProduct) return;



    const token = localStorage.getItem('token');

    if (!token) {

      setError('Authentication token not found. Please log in.');

      return;

    }



    let pictureUrl: string | undefined = editingProduct.picture;



    if (pictureFile) {

      const formData = new FormData();

      formData.append('file', pictureFile);



      try {

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {

          method: 'POST',

          headers: { 'x-auth-token': token },

          body: formData

        });



        if (!uploadRes.ok) throw new Error('File upload failed');



        const { url } = await uploadRes.json();

        pictureUrl = url;

      } catch (err) {

        console.error(err);

        setError('File upload failed.');

        return;

      }

    }



    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products/${editingProduct._id}`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

          'x-auth-token': token

        },

        body: JSON.stringify({

          name,

          short_description: shortDescription,

          description,

          picture: pictureUrl,

          price_before: parseFloat(price_before),

          price_after: parseFloat(price_after),

          categories: categories.split(',').map(c => c.trim()),

        })

      });



      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to update product');

      }



      const updatedProduct = await response.json();

      onProductsChange();

      setEditingProduct(null);

      setName('');

      setShortDescription('');

      setDescription('');

      setPriceBefore('');

      setPriceAfter('');

      setCategories('');

      setPictureFile(null);

    } catch (err: any) {

      console.error(err);

      setError(err.message || 'Failed to update product.');

    }

  };



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');



    if (!name || !shortDescription || !description || !pictureFile || !price_before || !price_after) {

      setError('Please fill in all required fields.');

      return;

    }



    const token = localStorage.getItem('token');

    if (!token) {

      setError('Authentication token not found. Please log in.');

      return;

    }



    let pictureUrl = '';



    if (pictureFile) {

      const formData = new FormData();

      formData.append('file', pictureFile);



      try {

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {

          method: 'POST',

          headers: {

            'x-auth-token': token,

          },

          body: formData,

        });



        if (!uploadRes.ok) {

          throw new Error('File upload failed');

        }



        const { url } = await uploadRes.json();

        pictureUrl = url;

      } catch (err: any) {

        console.error(err);

        setError(err.message || 'File upload failed. Please try again.');

        return;

      }

    }



    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'x-auth-token': token,

        },

        body: JSON.stringify({

          name,

          short_description: shortDescription,

          description,

          picture: pictureUrl,

          price_before: parseFloat(price_before),

          price_after: parseFloat(price_after),

          categories: categories.split(',').map(c => c.trim()),

          businessId,

        }),

      });



      if (!response.ok) {

        const data = await response.json();

        throw new Error(data.message || 'Failed to create product.');

      }



      setName('');

      setShortDescription('');

      setDescription('');

      setPictureFile(null);

      setPriceBefore('');

      setPriceAfter('');

      setCategories('');

      onProductsChange();

    } catch (err: any) {

      console.error(err);

      setError(err.message || 'An error occurred while creating the product.');

    }

  };



  if (editingProduct) {

    return (

      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">

        <h3 className="text-xl font-bold">Edit Product</h3>

        <form onSubmit={handleUpdate} className="space-y-4">

          {error && <p className="text-red-500 text-center">{error}</p>}

          <input

            type="text"

            placeholder="Name"

            value={name}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="text"

            placeholder="Short Description"

            value={shortDescription}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortDescription(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="text"

            placeholder="Description"

            value={description}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="file"

            onChange={handleFileChange}

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="number"

            placeholder="Price Before"

            value={price_before}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceBefore(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="number"

            placeholder="Price After"

            value={price_after}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceAfter(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <input

            type="text"

            placeholder="Categories (comma separated)"

            value={categories}

            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategories(e.target.value)}

            required

            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

          />

          <div className="flex space-x-4">

            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Save</button>

            <button type="button" onClick={() => setEditingProduct(null)} className="w-full px-4 py-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700">Cancel</button>

          </div>

        </form>

      </div>

    );

  }



  return (

    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">

      <h3 className="text-xl font-bold">Create Product</h3>

      <form onSubmit={onSubmit} className="space-y-4">

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input

          type="text"

          placeholder="Name"

          value={name}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="text"

          placeholder="Short Description"

          value={shortDescription}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortDescription(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="text"

          placeholder="Description"

          value={description}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="file"

          onChange={handleFileChange}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="number"

          placeholder="Price Before"

          value={price_before}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceBefore(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="number"

          placeholder="Price After"

          value={price_after}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceAfter(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <input

          type="text"

          placeholder="Categories (comma separated)"

          value={categories}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategories(e.target.value)}

          required

          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"

        />

        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">

          Create Product

        </button>

      </form>

    </div>

  );

};



export default Product;
