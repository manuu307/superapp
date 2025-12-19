"use client";
import React, { useState, useEffect, useCallback } from 'react';
import BusinessCatalog from './BusinessCatalog';
import Product from './Product';

interface BusinessItem {
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
  subdomain?: string;
  openDaysHours?: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
  }[];
}

const Business = () => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [name, setName] = useState<string>('');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [aboutUs, setAboutUs] = useState<string>('');
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [subdomain, setSubdomain] = useState<string>('');
  const [openDaysHours, setOpenDaysHours] = useState<{ dayOfWeek: string; openTime: string; closeTime: string; }[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);

  const fetchProducts = useCallback(async (businessId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/products/${businessId}`, {
        headers: {
          'x-auth-token': token || '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  }, []);

  const onProductsChange = () => {
    if (selectedBusiness) {
      fetchProducts(selectedBusiness._id);
    }
  };


  const fetchBusinesses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where token is not available, e.g., redirect to login
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/business`, {
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

  useEffect(() => {
    if (selectedBusiness) {
      fetchProducts(selectedBusiness._id);
    }
  }, [selectedBusiness, fetchProducts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPictureFile(e.target.files[0]);
    }
  };
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


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where token is not available
      return;
    }
    let pictureUrl: string = '';
    let bannerUrl: string = '';

    if (pictureFile) {
      const formData = new FormData();
      formData.append('file', pictureFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Picture upload failed');
                const { url } = await uploadRes.json();
                pictureUrl = url;
              } catch (err: unknown) {
                if (err instanceof Error) {
                  console.error(err.message);
                } else {
                  console.error('An unknown error occurred during picture upload');
                }
                return;
              }
            }
    if (bannerFile) {
      const formData = new FormData();
      formData.append('file', bannerFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Banner upload failed');
        const { url } = await uploadRes.json();
        bannerUrl = url;
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error('An unknown error occurred during banner upload');
        }
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name,
          picture: pictureUrl,
          bannerMedia: bannerUrl,
          aboutUs,
          deliveryAvailable,
          location: {
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          subdomain,
          openDaysHours
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create business');
      }

      setName('');
      setPictureFile(null);
      setBannerFile(null);
      setAboutUs('');
      setDeliveryAvailable(false);
      setAddress('');
      setLatitude('');
      setLongitude('');
      setSubdomain('');
      setOpenDaysHours([]);
      fetchBusinesses();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred during business creation');
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    let pictureUrl: string | undefined = editingBusiness.picture;
    let bannerUrl: string | undefined = editingBusiness.bannerMedia;

    if (pictureFile) {
      const formData = new FormData();
      formData.append('file', pictureFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Picture upload failed');
        const { url } = await uploadRes.json();
        pictureUrl = url;
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error('An unknown error occurred during picture upload on update');
        }
        return;
      }
    }

    if (bannerFile) {
      const formData = new FormData();
      formData.append('file', bannerFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Banner upload failed');
        const { url } = await uploadRes.json();
        bannerUrl = url;
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error('An unknown error occurred during banner upload on update');
        }
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/business/${editingBusiness._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          name,
          picture: pictureUrl,
          bannerMedia: bannerUrl,
          aboutUs,
          deliveryAvailable,
          location: {
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          subdomain,
          openDaysHours
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update business');
      }

      const updatedBusiness = await response.json();
      setBusinesses(businesses.map(b => b._id === editingBusiness._id ? updatedBusiness : b));
      setEditingBusiness(null);
      setName('');
      setPictureFile(null);
      setBannerFile(null);
      setAboutUs('');
      setDeliveryAvailable(false);
      setAddress('');
      setLatitude('');
      setLongitude('');
      setSubdomain('');
      setOpenDaysHours([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred during business update');
      }
    }
  };

  const handleEdit = (business: BusinessItem) => {
    setEditingBusiness(business);
    setName(business.name);
    setPictureFile(null); // Keep pictureFile as null to avoid re-upload unless changed
    setBannerFile(null); // Keep bannerFile as null to avoid re-upload unless changed
    setAboutUs(business.aboutUs || '');
    setDeliveryAvailable(business.deliveryAvailable || false);
    setAddress(business.location?.address || '');
    setLatitude(business.location?.latitude?.toString() || '');
    setLongitude(business.location?.longitude?.toString() || '');
    setSubdomain(business.subdomain || '');
    setOpenDaysHours(business.openDaysHours || []);
  };

  const handleDelete = async (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        // Handle case where token is not available
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/business/${businessId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          throw new Error('Failed to delete business');
        }
        setBusinesses(businesses.filter(b => b._id !== businessId));
      } catch (error) {
        console.error('Error deleting business:', error);
        // Optionally set an error state
      }
    }
  };

  const handleAddDay = () => {
    setOpenDaysHours([...openDaysHours, { dayOfWeek: '', openTime: '', closeTime: '' }]);
  };

  const handleRemoveDay = (index: number) => {
    const newDays = [...openDaysHours];
    newDays.splice(index, 1);
    setOpenDaysHours(newDays);
  };

  const handleDayChange = (index: number, field: string, value: string) => {
    const newDays = [...openDaysHours];
    newDays[index] = { ...newDays[index], [field]: value };
    setOpenDaysHours(newDays);
  };

  if (editingBusiness) {
    return (
      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold">Edit Business</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Business Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <textarea
            placeholder="About Us"
            value={aboutUs}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAboutUs(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Subdomain"
            value={subdomain}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubdomain(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Latitude"
              value={latitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatitude(e.target.value)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={longitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongitude(e.target.value)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="deliveryAvailableEdit"
              checked={deliveryAvailable}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="deliveryAvailableEdit" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery Available</label>
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="business-picture-edit">
              Business Picture
            </label>
            <input
              id="business-picture-edit"
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPictureFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="business-banner-edit">
              Business Banner
            </label>
            <input
              id="business-banner-edit"
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBannerFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">Operating Hours</h3>
            {openDaysHours.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Day of Week"
                  value={day.dayOfWeek}
                  onChange={(e) => handleDayChange(index, 'dayOfWeek', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
                <button type="button" onClick={() => handleRemoveDay(index)} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">-</button>
              </div>
            ))}
            <button type="button" onClick={handleAddDay} className="w-full px-4 py-2 mt-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700">+</button>
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Save</button>
            <button type="button" onClick={() => setEditingBusiness(null)} className="w-full px-4 py-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  if (selectedBusiness) {
    return (
      <div className="p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <button onClick={() => setSelectedBusiness(null)} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Back to Businesses</button>
        <div className="flex items-center space-x-4">
          <img
            src={selectedBusiness.picture || 'https://via.placeholder.com/150'}
            alt={selectedBusiness.name}
            width={96} // Equivalent to w-24 (24 * 4 = 96px)
            height={96} // Equivalent to h-24 (24 * 4 = 96px)
            className="rounded-full"
          />
          <h2 className="text-2xl font-bold">{selectedBusiness.name}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Product businessId={selectedBusiness._id} onProductsChange={onProductsChange} />
          <BusinessCatalog products={products} onProductsChange={onProductsChange} />
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
        <textarea
          placeholder="About Us"
          value={aboutUs}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAboutUs(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <input
          type="text"
          placeholder="Subdomain"
          value={subdomain}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubdomain(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatitude(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongitude(e.target.value)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="deliveryAvailable"
            checked={deliveryAvailable}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAvailable(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="deliveryAvailable" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery Available</label>
        </div>
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
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="business-banner">
            Business Banner
          </label>
          <input
            id="business-banner"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBannerFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Create Business</button>
      </form>
      <div>
        <h3 className="text-xl font-bold">Operating Hours</h3>
        {openDaysHours.map((day, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Day of Week"
              value={day.dayOfWeek}
              onChange={(e) => handleDayChange(index, 'dayOfWeek', e.target.value)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <input
              type="time"
              value={day.openTime}
              onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <input
              type="time"
              value={day.closeTime}
              onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
              className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button onClick={() => handleRemoveDay(index)} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">-</button>
          </div>
        ))}
        <button onClick={handleAddDay} className="w-full px-4 py-2 mt-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700">+</button>
      </div>
      <ul className="space-y-2">
        {businesses.map((business: BusinessItem) => (
          <li key={business._id} className="flex items-center justify-between p-2 space-x-4 bg-gray-200 rounded-md dark:bg-gray-700">
            <div onClick={() => setSelectedBusiness(business)} className="flex items-center flex-grow space-x-4 cursor-pointer">
              <img
                src={business.picture || 'https://via.placeholder.com/50'}
                alt={business.name}
                width={48} // Equivalent to w-12 (12 * 4 = 48px)
                height={48} // Equivalent to h-12 (12 * 4 = 48px)
                className="rounded-full"
              />
              <span>{business.name}</span>
            </div>
            <div>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(business); }} className="px-3 py-1 mr-2 text-white bg-blue-500 rounded-md hover:bg-blue-700">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(business._id); }} className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Business;