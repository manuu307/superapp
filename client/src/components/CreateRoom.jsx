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
    <div className="create-room-form">
      <h3>Create a New Room</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private Room
          </label>
        </div>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div>
          <h4>Users</h4>
          {users.map((user) => (
            <div key={user._id}>
              <label>
                <input
                  type="checkbox"
                  onChange={() => handleUserSelection(user._id)}
                />
                {user.username}
              </label>
            </div>
          ))}
        </div>
        <div>
          <h4>Admins</h4>
          {selectedUsers.map((userId) => {
            const user = users.find(u => u._id === userId);
            return user ? (
              <div key={user._id}>
                <label>
                  <input
                    type="checkbox"
                    onChange={() => handleAdminSelection(user._id)}
                  />
                  {user.username}
                </label>
              </div>
            ) : null;
          })}
        </div>
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default CreateRoom;


