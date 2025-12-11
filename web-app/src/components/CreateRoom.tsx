"use client";
import React, { useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  username: string;
  // Add other user properties if they are used in this component
}

interface CreateRoomProps {
  token: string | null;
  onRoomCreated: (room: any) => void; // Consider defining a more specific Room interface
}

const CreateRoom: React.FC<CreateRoomProps> = ({ token, onRoomCreated }) => {
  const [roomName, setRoomName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [tags, setTags] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/users`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users.');
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAdminSelection = (userId: string) => {
    setAdmins((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomName) {
      setError('Room name is required.');
      return;
    }
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: roomName,
          description,
          isPrivate,
          tags: tags.split(',').map(tag => tag.trim()),
          users: selectedUsers,
          admins,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      onRoomCreated(data.name);
      setRoomName('');
      setDescription('');
      setIsPrivate(false);
      setTags('');
      setSelectedUsers([]);
      setAdmins([]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the room.');
    }
  };

  return (
    <div className="p-4 my-4 bg-white rounded-md shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-bold text-center">Create a New Room</h3>
      {error && <p className="p-2 mb-4 text-white bg-red-500 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        ></textarea>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private Room
          </label>
        </div>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <div>
          <h4 className="mb-2 font-bold">Users</h4>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user: User) => (
              <div key={user._id}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={() => handleUserSelection(user._id)}
                    className="mr-2"
                    checked={selectedUsers.includes(user._id)}
                  />
                  {user.username}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-bold">Admins</h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedUsers.map((userId: string) => {
              const user = users.find(u => u._id === userId);
              return user ? (
                <div key={user._id}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => handleAdminSelection(user._id)}
                      className="mr-2"
                      checked={admins.includes(user._id)}
                    />
                    {user.username}
                  </label>
                </div>
              ) : null;
            })}
          </div>
        </div>
        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Create Room</button>
      </form>
    </div>
  );
};

export default CreateRoom;