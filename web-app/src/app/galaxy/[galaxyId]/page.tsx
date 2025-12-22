"use client";

import { useState, useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext, AuthContextType } from '@/context/AuthContext';
import { ThemeContext } from '@/context/ThemeContext';
import { withProtectedRoute } from '@/app/withProtectedRoute';

const GalaxyFormPage = () => {
  const router = useRouter();
  const params = useParams();
  const { galaxyId } = params;

  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    // This can happen if the context provider is not available.
    // withProtectedRoute should prevent this, but it's good practice to check.
    return <div>Loading...</div>;
  }

  const { token } = authContext;
  const { theme } = themeContext;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    tags: '',
    profileImage: '',
    bannerImage: '',
  });
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (galaxyId && galaxyId !== 'new') {
      setIsNew(false);
      const fetchGalaxyData = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/galaxies/${galaxyId}`, {
            headers: { 'x-auth-token': token || '' }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData({
              name: data.name,
              description: data.description || '',
              purpose: data.purpose || '',
              tags: data.tags.join(', '),
              profileImage: data.profileImage || '',
              bannerImage: data.bannerImage || '',
            });
          } else {
            console.error("Failed to fetch galaxy data");
            router.push('/universe');
          }
        } catch (error) {
          console.error("Error fetching galaxy data:", error);
        }
      };
      if (token) {
        fetchGalaxyData();
      }
    }
  }, [galaxyId, token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { tags, ...otherData } = formData;
    const payload = {
      ...otherData,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    if (payload.tags.length === 0) {
      alert('Please provide at least one tag.');
      return;
    }

    const url = isNew ? `${process.env.NEXT_PUBLIC_API_BASE_PATH}/galaxies` : `${process.env.NEXT_PUBLIC_API_BASE_PATH}/galaxies/${galaxyId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/universe');
      } else {
        const errorData = await res.json();
        console.error('Failed to save galaxy:', errorData);
        alert(`Error: ${errorData.msg || 'Failed to save galaxy.'}`);
      }
    } catch (error) {
      console.error('Error saving galaxy:', error);
      alert('An unexpected error occurred.');
    }
  };

  const formControlClass = `w-full px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-white text-black border border-gray-300'}`;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto p-4">
        <button onClick={() => router.back()} className="mb-4 text-blue-500 hover:underline">
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold mb-6">{isNew ? 'Create a New Universe' : 'Edit Universe'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={formControlClass} />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={formControlClass}></textarea>
          </div>
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium mb-1">Purpose</label>
            <textarea name="purpose" id="purpose" value={formData.purpose} onChange={handleChange} rows={2} className={formControlClass}></textarea>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated) *</label>
            <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} required className={formControlClass} />
          </div>
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium mb-1">Profile Image URL</label>
            <input type="text" name="profileImage" id="profileImage" value={formData.profileImage} onChange={handleChange} className={formControlClass} />
          </div>
          <div>
            <label htmlFor="bannerImage" className="block text-sm font-medium mb-1">Banner Image URL</label>
            <input type="text" name="bannerImage" id="bannerImage" value={formData.bannerImage} onChange={handleChange} className={formControlClass} />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md bg-gray-500 text-white font-semibold hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600">
              {isNew ? 'Create Universe' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withProtectedRoute(GalaxyFormPage);
