import React, { useState, useEffect, useCallback } from 'react';

const Product = ({ businessId }) => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [price_before, setPriceBefore] = useState('');
  const [price_after, setPriceAfter] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/products/${businessId}`);
    const data = await res.json();
    setProducts(data);
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchProducts();
    }
  }, [businessId, fetchProducts]);

  const handleFileChange = (e) => {
    setPictureFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !shortDescription || !description || !pictureFile || !price_before || !price_after) {
      setError('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    let pictureUrl = '';

    if (pictureFile) {
      const formData = new FormData();
      formData.append('file', pictureFile);

      try {
        const uploadRes = await fetch('/api/files/upload', {
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
      } catch (err) {
        console.error(err);
        setError('File upload failed. Please try again.');
        return;
      }
    }

    try {
      const response = await fetch('/api/products', {
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
          price_before,
          price_after,
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
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h3 className="text-xl font-bold">Create Product</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <input
          type="text"
          placeholder="Short Description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          onChange={(e) => setPriceBefore(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <input
          type="number"
          placeholder="Price After"
          value={price_after}
          onChange={(e) => setPriceAfter(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">
          Create Product
        </button>
      </form>
      <div>
        <h3 className="text-xl font-bold">Products</h3>
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product._id} className="p-2 bg-gray-200 rounded-md dark:bg-gray-700">
              {product.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Product;