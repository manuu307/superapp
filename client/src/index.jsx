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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'x-auth-token': token,
        },
      });
      if (response.status === 401) {
        logout();
        return;
      }
      const data = await response.json();
      setUser(data);
      setRooms(data.rooms || []);
      if (data.rooms && !data.rooms.includes(room)) {
        setRoom(data.rooms[0] || 'General');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
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

  const handleProfileUpdate = () => {
    fetchUser();
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {isLogin ? (
            <Login setToken={setToken} />
          ) : (
            <Register setToken={setToken} />
          )}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-900"
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="h-screen text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between p-4 bg-white shadow-md dark:bg-gray-800">
        <div>
          <button onClick={() => setView('chat')} className="px-4 py-2 mr-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-900">Chat</button>
          <button onClick={() => setView('profile')} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-900">Profile</button>
        </div>
        <button onClick={toggleTheme} className="px-4 py-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-900">
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
      {view === 'chat' ? (
        <div className="flex h-[calc(100vh-64px)]">
          <div className="flex flex-col w-1/4 p-4 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-xl font-bold">Rooms</h2>
            <button onClick={() => setShowCreateRoom(!showCreateRoom)} className="w-full px-4 py-2 mb-4 font-bold text-white bg-green-500 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-900">
              {showCreateRoom ? 'Cancel' : 'Create Room'}
            </button>
            {showCreateRoom && <CreateRoom token={token} onRoomCreated={handleRoomCreated} />}
            <ul className="overflow-y-auto">
              {rooms.map((r) => (
                <li key={r} onClick={() => setRoom(r)} className={`p-2 cursor-pointer rounded-md ${r === room ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {r}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              <span>{user?.username}</span>
              <button onClick={logout} className="px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-700">Logout</button>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold">Room: {room}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {chat.map((msg, index) => (
                <div key={index} className={`flex mb-4 ${msg.sender === user?.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg ${msg.sender === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className="text-sm font-bold">{msg.sender}</div>
                    <div className="text-lg">
                      {msg.text.startsWith('http://') && (msg.text.endsWith('.jpg') || msg.text.endsWith('.png') || msg.text.endsWith('.gif')) ? (
                        <img src={msg.text} alt="Uploaded content" className="max-w-xs rounded-md" />
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <form className="flex p-4 border-t border-gray-200 dark:border-gray-700" onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 mr-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
              <input type="file" id="file-input" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="file-input" className="p-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">📎</label>
              <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Send</button>
            </form>
          </div>
        </div>
      ) : (
        <Profile user={user} token={token} onProfileUpdate={handleProfileUpdate} />
      )}
    </div>
  );
}

export default App;
