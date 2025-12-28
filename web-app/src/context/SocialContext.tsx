"use client";
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
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

interface UserInRoom {
  _id: string;
  username: string;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  tags: string[];
  users: UserInRoom[];
  admins: UserInRoom[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
}

interface SocialContextType {
  room: string;
  setRoom: (room: string | null) => void;
  rooms: string[];
  message: string;
  setMessage: (message: string) => void;
  chat: Message[];
  sendMessage: (e: React.FormEvent) => void;
  showCreateRoom: boolean;
  setShowCreateRoom: (show: boolean) => void;
  handleRoomCreated: (room: Room) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SocialProviderProps {
  children: React.ReactNode;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

let socket: Socket;

const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { token, user } = useContext(AuthContext) as AuthContextType;
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newlyCreatedRooms, setNewlyCreatedRooms] = useState<string[]>([]);

  const rooms = useMemo(() => {
    const userRooms = user?.rooms || [];
    const allRooms = new Set([...userRooms, ...newlyCreatedRooms]);
    return Array.from(allRooms);
  }, [user, newlyCreatedRooms]);

  const room = useMemo(() => {
    if (selectedRoom && rooms.includes(selectedRoom)) {
      return selectedRoom;
    }
    if (rooms.length > 0) {
      return rooms[0];
    }
    return 'General';
  }, [selectedRoom, rooms]);

  useEffect(() => {
    if (room !== selectedRoom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoom(room);
    }
  }, [room, selectedRoom]);

  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<Message[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);

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

      socket.on('new_room', (newRoom: Room) => {
        setNewlyCreatedRooms((prevRooms) => [...prevRooms, newRoom.name]);
      });

      return () => {
        socket.off('connect');
        socket.off('load_history');
        socket.off('receive_message');
        socket.off('new_room');
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

  const handleRoomCreated = useCallback((newRoom: Room) => {
    setNewlyCreatedRooms((prevRooms) => [...prevRooms, newRoom.name]);
    setSelectedRoom(newRoom.name);
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
      setRoom: setSelectedRoom,
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
export type { SocialContextType, Room };
