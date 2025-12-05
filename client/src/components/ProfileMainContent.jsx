import React, { useState } from 'react';

const ProfileMainContent = ({ user, token, onContactsUpdate }) => {
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
      onContactsUpdate();
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
      onContactsUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-main-content">
      <div className="rooms-section">
        <h4>Rooms</h4>
        <ul>
          {user.rooms && user.rooms.map(room => <li key={room}>{room}</li>)}
        </ul>
      </div>
      <div className="contacts-section">
        <h4>Contacts</h4>
        <ul>
          {user.contacts && user.contacts.map(contact => (
            <li key={contact._id}>
              {contact.username}
              <button onClick={() => removeContact(contact._id)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="add-contact">
          <h5>Add Contact</h5>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <ul className="search-results">
            {searchResults.map(foundUser => (
              <li key={foundUser._id}>
                {foundUser.username}
                <button onClick={() => addContact(foundUser._id)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileMainContent;
