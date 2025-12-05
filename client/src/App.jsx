import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CreateRoom from './components/CreateRoom';
import Profile from './components/Profile';

let socket;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  const [room, setRoom] = useState('General');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('chat'); // 'chat' or 'profile'

  useEffect(() => {
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'x-auth-token': token,
            },
          });
          const data = await response.json();
          setUser(data);
          setRooms(data.rooms || []);
          if (data.rooms && !data.rooms.includes(room)) {
            setRoom(data.rooms[0] || 'General');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          // Handle token expiration or invalid token
          localStorage.removeItem('token');
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      socket = io({
        auth: {
          token,
        },
      });

      socket.on('connect', () => {
        console.log('connected');
        socket.emit('join_room', room);
      });

      socket.on('load_history', (history) => {
        setChat(history);
      });

      socket.on('receive_message', (data) => {
        setChat((prevChat) => [...prevChat, data]);
      });

      return () => {
        socket.off('connect');
        socket.off('load_history');
        socket.off('receive_message');
        socket.disconnect();
      };
    }
  }, [user, token, room]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== '') {
      const messageData = {
        room,
        text: message,
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const handleRoomCreated = (newRoom) => {
    setRooms([...rooms, newRoom.name]);
    setRoom(newRoom.name);
    setShowCreateRoom(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      
      const messageData = {
        room,
        text: data.url,
      };
      socket.emit('send_message', messageData);

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  if (!token) {
    return (
      <div className="App">
        <div className="auth-container">
          {isLogin ? (
            <Login setToken={setToken} />
          ) : (
            <Register setToken={setToken} />
          )}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="top-nav">
        <button onClick={() => setView('chat')}>Chat</button>
        <button onClick={() => setView('profile')}>Profile</button>
      </div>
      {view === 'chat' ? (
        <div className="main-container">
          <div className="rooms-container">
            <h2>Rooms</h2>
            <button onClick={() => setShowCreateRoom(!showCreateRoom)} className="create-room-btn">
              {showCreateRoom ? 'Cancel' : 'Create Room'}
            </button>
            {showCreateRoom && <CreateRoom token={token} onRoomCreated={handleRoomCreated} />}
            <ul>
              {rooms.map((r) => (
                <li key={r} onClick={() => setRoom(r)} className={r === room ? 'active' : ''}>
                  {r}
                </li>
              ))}
            </ul>
            <div className="user-info">
              <span>{user?.username}</span>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
          <div className="chat-wrapper">
            <div className="chat-container">
              <div className="chat-header">
                <h3>Room: {room}</h3>
              </div>
              <div className="chat-messages">
                {chat.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender === user?.username ? 'own-message' : ''}`}>
                    <div className="message-sender">{msg.sender}</div>
                    <div className="message-text">
                      {msg.text.startsWith('http://') && (msg.text.endsWith('.jpg') || msg.text.endsWith('.png') || msg.text.endsWith('.gif')) ? (
                        <img src={msg.text} alt="Uploaded content" style={{ maxWidth: '200px' }} />
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              <form className="chat-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={message}
                  placeholder="Type a message..."
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input type="file" id="file-input" style={{ display: 'none' }} onChange={handleFileUpload} />
                <label htmlFor="file-input" className="file-input-label">📎</label>
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <Profile user={user} token={token} onProfileUpdate={handleProfileUpdate} onContactsUpdate={fetchUser} />
      )}
    </div>
  );
}

export default App;
