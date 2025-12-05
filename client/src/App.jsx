import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import CreateRoom from './components/CreateRoom';

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
