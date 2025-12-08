import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocialContext = createContext();

let socket;

const SocialProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [room, setRoom] = useState('General');
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    if (user) {
      setRooms(user.rooms || []);
      if (user.rooms && !user.rooms.includes(room)) {
        setRoom(user.rooms[0] || 'General');
      }
    }
  }, [user, room]);

  useEffect(() => {
    if (token) {
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
  }, [token, room, user]);

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

  return (
    <SocialContext.Provider value={{
      room,
      setRoom,
      rooms,
      message,
      setMessage,
      chat,
      sendMessage,
      showCreateRoom,
      setShowCreateRoom,
      handleRoomCreated,
      handleFileUpload,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export { SocialContext, SocialProvider };
