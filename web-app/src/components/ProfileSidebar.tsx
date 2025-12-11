"use client";
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface User {
  username: string;
  name?: string;
  lastname?: string;
  nickname?: string;
  tags?: string[];
  description?: string;
  website?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refetchUser: () => void;
}

interface FormDataState {
  name: string;
  lastname: string;
  nickname: string;
  tags: string[];
  description: string;
  website: string;
}

const ProfileSidebar = () => {
  const { user, token, refetchUser } = useContext(AuthContext) as AuthContextType;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    lastname: '',
    nickname: '',
    tags: [],
    description: '',
    website: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        nickname: user.nickname || '',
        tags: user.tags || [],
        description: user.description || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const { name, lastname, nickname, tags, description, website } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePictureFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadProfilePicture = async () => {
    if (!profilePictureFile || !token) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', profilePictureFile);

    try {
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        throw new Error('File upload failed');
      }

      const { url } = await uploadRes.json();

      const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/profile-picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ url })
      });

      if (!updateRes.ok) {
        throw new Error('Profile picture update failed');
      }

      refetchUser();
      setProfilePictureFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload profile picture.');
    }
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !lastname) {
      setError('Name and Last Name are required.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile.');
      }

      refetchUser();
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    }
  };

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-1/4 p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="text-center">
        <img
          src={user.profilePicture || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="object-cover w-32 h-32 mx-auto rounded-full cursor-pointer"
          onClick={handleUploadClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {profilePictureFile && <button onClick={uploadProfilePicture} className="w-full px-4 py-2 mt-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700">Save Picture</button>}
      </div>
      <h3 className="text-2xl font-bold text-center">{user.username}</h3>
      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <input type="text" placeholder="Last Name" name="lastname" value={lastname} onChange={onChange} required className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <input type="text" placeholder="Nickname" name="nickname" value={nickname} onChange={onChange} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <input type="text" placeholder="Tags (comma separated)" value={tags.join(', ')} onChange={onTagsChange} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <textarea placeholder="Description" name="description" value={description} onChange={onChange} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"></textarea>
          <input type="text" placeholder="Website URL" name="website" value={website} onChange={onChange} className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Save</button>
          <button type="button" onClick={() => setIsEditing(false)} className="w-full px-4 py-2 mt-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700">Cancel</button>
        </form>
      ) : (
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Last Name:</strong> {user.lastname}</p>
          <p><strong>Nickname:</strong> {user.nickname}</p>
          <p><strong>Description:</strong> {user.description}</p>
          <p><strong>Website:</strong> <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{user.website}</a></p>
          <div className="flex py-2 flex-wrap gap-2">
            {user.tags && user.tags.map(tag => <span key={tag} className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full">{tag}</span>)}
          </div>
          <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;