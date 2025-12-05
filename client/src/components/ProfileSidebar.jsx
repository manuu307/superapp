import React, { useState, useEffect } from 'react';

const ProfileSidebar = ({ user, token, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    nickname: '',
    tags: [],
    description: '',
    website: ''
  });

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

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onTagsChange = e => {
    setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
      const updatedUser = await response.json();
      onProfileUpdate(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-sidebar">
      <h3>{user.username}</h3>
      {isEditing ? (
        <form onSubmit={onSubmit}>
          <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} />
          <input type="text" placeholder="Last Name" name="lastname" value={lastname} onChange={onChange} />
          <input type="text" placeholder="Nickname" name="nickname" value={nickname} onChange={onChange} />
          <input type="text" placeholder="Tags (comma separated)" value={tags.join(', ')} onChange={onTagsChange} />
          <textarea placeholder="Description" name="description" value={description} onChange={onChange}></textarea>
          <input type="text" placeholder="Website URL" name="website" value={website} onChange={onChange} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Last Name:</strong> {user.lastname}</p>
          <p><strong>Nickname:</strong> {user.nickname}</p>
          <p><strong>Description:</strong> {user.description}</p>
          <p><strong>Website:</strong> <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a></p>
          <div className="tags-container">
            {user.tags && user.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default ProfileSidebar;
