import React, { useState, useEffect } from 'react';

const CreateRoom = ({ token, onRoomCreated }) => {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAdminSelection = (userId) => {
    setAdmins((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!roomName) {
      setError('Room name is required.');
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
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
    } catch (err) {
      setError(err.message);
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
          onChange={(e) => setRoomName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        ></textarea>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private Room
          </label>
        </div>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        <div>
          <h4 className="mb-2 font-bold">Users</h4>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <div key={user._id}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={() => handleUserSelection(user._id)}
                    className="mr-2"
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
            {selectedUsers.map((userId) => {
              const user = users.find(u => u._id === userId);
              return user ? (
                <div key={user._id}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => handleAdminSelection(user._id)}
                      className="mr-2"
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