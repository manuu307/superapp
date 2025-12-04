import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setUsername('');
      setEmail('');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });
      const updatedUser = await response.json();
      setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
      setUsername('');
      setEmail('');
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
  };

  return (
    <div>
      <h2>User Management</h2>
      <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {editingUser ? (
          <div>
            <button type="submit">Update User</button>
            <button type="button" onClick={cancelEditing}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Create User</button>
        )}
      </form>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.username} ({user.email})
            <button onClick={() => startEditing(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
