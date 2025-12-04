import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

let socket;

function App() {
  console.log('App component rendered');
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Initial token from localStorage:', storedToken);
    return storedToken;
  });
  const [isLogin, setIsLogin] = useState(true);
  const [room, setRoom] = useState('General');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Token state changed:', token);
    if (token) {
      const fetchUser = async () => {
        console.log('Fetching user with token:', token);
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'x-auth-token': token,
            },
          });
          if (!response.ok) {
            throw new Error('Invalid token');
          }
          const data = await response.json();
          setUser(data);
          setRooms(data.rooms);
          if (!data.rooms.includes(room)) {
            setRoom(data.rooms[0] || 'General');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          // Handle token expiration or invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      };
      fetchUser();
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

  if (!token) {
    console.log('No token, rendering auth forms');
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

  console.log('Token exists, rendering main app');
  return (
    <div className="App">
      <div className="main-container">
        <div className="rooms-container">
          <h2>Rooms</h2>
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
                  <div className="message-text">{msg.text}</div>
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
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
