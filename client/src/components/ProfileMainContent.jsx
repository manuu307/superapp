import React, { useState, useContext } from 'react';
import Catalog from './Catalog';
import { AuthContext } from '../context/AuthContext';

const ProfileMainContent = () => {
  const { user, token, refetchUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(`/api/users/search?query=${searchQuery}`, {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addContact = async (userId) => {
    try {
      await fetch(`/api/users/contacts/add/${userId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token }
      });
      refetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  const removeContact = async (userId) => {
    try {
      await fetch(`/api/users/contacts/remove/${userId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      refetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <>
    <div className="flex-1 p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div>
        <h4 className="mb-2 text-xl font-bold">Rooms</h4>
        <ul className="space-y-2">
          {user.rooms && user.rooms.map(room => <li key={room} className="p-2 bg-gray-200 rounded-md dark:bg-gray-700">{room}</li>)}
        </ul>
      </div>
      <Catalog />
    </div>
        <div className="flex-1 p-4 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h4 className="mb-2 text-xl font-bold">Contacts</h4>
        <ul className="space-y-2">
          {user.contacts && user.contacts.map(contact => (
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 mr-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Search</button>
          </form>
          <ul className="mt-2 space-y-2">
            {searchResults.map(foundUser => (
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
