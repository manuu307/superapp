import React, { useState, useEffect, useRef } from 'react';

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
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const uploadProfilePicture = async () => {
    if (!profilePictureFile) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', profilePictureFile);

    try {
      const uploadRes = await fetch('/api/files/upload', {
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

      const updateRes = await fetch('/api/users/profile-picture', {
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

      const updatedUser = await updateRes.json();
      onProfileUpdate({ ...user, profilePicture: updatedUser.profilePicture });
      setProfilePictureFile(null);
    } catch (err) {
      console.error(err);
    }
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
      <div className="profile-picture-container">
        <img src={user.profilePicture || 'https://via.placeholder.com/150'} alt="Profile" className="profile-picture" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <button onClick={handleUploadClick}>Change Picture</button>
        {profilePictureFile && <button onClick={uploadProfilePicture}>Save Picture</button>}
      </div>
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
