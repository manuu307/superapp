"use client";
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import UsersCatalog from './UsersCatalog';
import { AuthContext, AuthContextType } from '../context/AuthContext';

const ProfileMainContent = () => {
  const { user, token, refetchUser } = useContext(AuthContext) as AuthContextType;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/search?query=${searchQuery}`, {
        headers: { 'x-auth-token': token || '' }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred during search');
      }
    }
  };

  const addContact = async (userId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/contacts/add/${userId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' }
      });
      refetchUser();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred when adding a contact');
      }
    }
  };

  const removeContact = async (userId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users/contacts/remove/${userId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' }
      });
      refetchUser();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred when removing a contact');
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <>
    <div className="flex-1 p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">My Universe</h4>
        <button 
          onClick={() => router.push('/galaxy/new')}
          className="px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:bg-green-700"
        >
          + Create New Universe
        </button>
      </div>
      <div>
        <h4 className="mb-2 text-xl font-bold">Rooms</h4>
        <ul className="space-y-2">
          {user.rooms && user.rooms.map((room: string) => <li key={room} className="p-2 bg-gray-200 rounded-md dark:bg-gray-700">{room}</li>)}
        </ul>
      </div>
      <UsersCatalog />
    </div>
        <div className="flex-1 p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h4 className="mb-2 text-xl font-bold">Contacts</h4>
        <ul className="space-y-2">
          {user.contacts && user.contacts.map((contact) => (
            <li key={contact._id} className="flex items-center justify-between p-2 bg-gray-200 rounded-md dark:bg-gray-700">
              <span>{contact.username}</span>
              <button onClick={() => removeContact(contact._id)} className="px-3 py-1 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">Remove</button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <h5 className="mb-2 text-lg font-bold">Add Contact</h5>
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 mr-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Search</button>
          </form>
          <ul className="mt-2 space-y-2">
            {searchResults.map((foundUser) => (
              <li key={foundUser._id} className="flex items-center justify-between p-2 bg-gray-200 rounded-md dark:bg-gray-700">
                <span>{foundUser.username}</span>
                <button onClick={() => addContact(foundUser._id)} className="px-3 py-1 font-bold text-white bg-green-500 rounded-md hover:bg-green-700">Add</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </>
  );
};

export default ProfileMainContent;
