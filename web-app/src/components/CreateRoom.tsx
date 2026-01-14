"use client";
import React, { useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  username: string;
  // Add other user properties if they are used in this component
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  isOneToOne: boolean;
  tags: string[];
  users: User[];
  admins: User[];
}

interface CreateRoomProps {
  token: string | null;
  onRoomCreated: (room: Room) => void;
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
  const [chatType, setChatType] = useState<'group' | 'one-on-one'>('group');

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
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch users.');
      }
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

      onRoomCreated(data);
      setRoomName('');
      setDescription('');
      setIsPrivate(false);
      setTags('');
      setSelectedUsers([]);
      setAdmins([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      else {
        setError('An error occurred while creating the room.');
      }
    }
  };

  const handleCreateOneToOneChat = async (userId: string) => {
    setError(null);
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/rooms/one-to-one`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create one-to-one chat');
      }

      onRoomCreated(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      else {
        setError('An error occurred while creating the one-to-one chat.');
      }
    }
  };

  return (
    <div className="p-4 my-4 bg-white rounded-md shadow-md dark:bg-gray-800">
      <div className="flex justify-center mb-4">
        <button onClick={() => setChatType('group')} className={`px-4 py-2 font-bold ${chatType === 'group' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
          Group
        </button>
        <button onClick={() => setChatType('one-on-one')} className={`px-4 py-2 font-bold ${chatType === 'one-on-one' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>
          1-to-1
        </button>
      </div>
      <h3 className="mb-4 text-xl font-bold text-center">Create a New {chatType === 'group' ? 'Room' : '1-to-1 Chat'}</h3>
      {error && <p className="p-2 mb-4 text-white bg-red-500 rounded-md">{error}</p>}
      {chatType === 'group' ? (
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
      ) : (
        <div>
          <h4 className="mb-2 font-bold">Users</h4>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user: User) => (
              <div key={user._id} onClick={() => handleCreateOneToOneChat(user._id)} className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                {user.username}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;