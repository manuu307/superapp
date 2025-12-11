"use client";
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface Message {
  sender: string;
  text: string;
  timestamp: string; // Assuming timestamp is a string, could be Date
}

interface User {
  username: string;
  rooms?: string[]; // Assuming rooms is an optional array of strings
  // Add other user properties if they are used in this component
}

interface AuthContextType {
  token: string | null;
  user: User | null;
}

interface SocialContextType {
  room: string;
  setRoom: (room: string) => void;
  rooms: string[];
  message: string;
  setMessage: (message: string) => void;
  chat: Message[];
  sendMessage: (e: React.FormEvent) => void;
  showCreateRoom: boolean;
  setShowCreateRoom: (show: boolean) => void;
  handleRoomCreated: (roomName: string) => void; // Refined type for room
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SocialProviderProps {
  children: React.ReactNode;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

let socket: Socket;

const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { token, user } = useContext(AuthContext) as AuthContextType;
  const [room, setRoom] = useState<string>('General');
  const [rooms, setRooms] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<Message[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setRooms(user.rooms || []);
      if (user.rooms && user.rooms.length > 0 && !user.rooms.includes(room)) {
        setRoom(user.rooms[0]);
      } else if (!user.rooms || user.rooms.length === 0) {
        setRoom('General'); // Default to General if no rooms
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

      socket.on('load_history', (history: Message[]) => {
        setChat(history);
      });

      socket.on('receive_message', (data: Message) => {
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

  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message !== '') {
      const messageData = {
        room,
        text: message,
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  }, [message, room]);

  const handleRoomCreated = useCallback((newRoomName: string) => {
    setRooms((prevRooms) => [...prevRooms, newRoomName]);
    setRoom(newRoomName);
    setShowCreateRoom(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/files/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
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
  }, [room, token]);

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
