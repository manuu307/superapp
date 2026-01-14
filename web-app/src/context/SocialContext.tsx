"use client";
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import axios from 'axios';

interface Message {
  type?: 'text' | 'image' | 'audio' | 'energy';
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  } | null;
  text: string;
  timestamp: string;
  energyData?: {
    sender: { username: string };
    recipient: { username: string };
    amount: number;
  };
}

interface User {
    _id: string;
  username: string;
  profilePicture?: string;
  rooms?: string[]; // Assuming rooms is an optional array of strings
  // Add other user properties if they are used in this component
}

interface UserInRoom {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  isOneToOne: boolean;
  tags: string[];
  users: UserInRoom[];
  admins: UserInRoom[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
}

interface SocialContextType {
  socket: Socket | null;
  room: Room | null;
  setRoom: (room: Room | null) => void;
  rooms: Room[];
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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [fetchedRooms, setFetchedRooms] = useState<Room[]>([]);
  const [newlyCreatedRooms, setNewlyCreatedRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (token) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/rooms`, {
            headers: {
              'x-auth-token': token,
            },
          });
          setFetchedRooms(response.data);
        } catch (error) {
          console.error('Error fetching rooms:', error);
        }
      }
    };
    fetchRooms();
  }, [token]);

  const rooms = useMemo(() => {
    const allRooms = [...fetchedRooms, ...newlyCreatedRooms];
    const uniqueRooms = allRooms.filter((room, index, self) =>
      index === self.findIndex((r) => r._id === room._id)
    );
    return uniqueRooms;
  }, [fetchedRooms, newlyCreatedRooms]);

  const room = useMemo(() => {
    if (selectedRoom && rooms.find(r => r._id === selectedRoom._id)) {
      return selectedRoom;
    }
    if (rooms.length > 0) {
      return rooms[0];
    }
    return null;
  }, [selectedRoom, rooms]);

  useEffect(() => {
    if (room && room !== selectedRoom) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRoom(room);
    }
  }, [room, selectedRoom]);

  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<Message[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);

  useEffect(() => {
    if (token && room) {
      socket = io({
        auth: {
          token,
        },
      });

      socket.on('connect', () => {
        console.log('connected');
        socket.emit('join_room', room.name);
      });

      socket.on('load_history', (history: Message[]) => {
        setChat(history);
      });

      socket.on('receive_message', (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
      });

      socket.on('receive_energy_message', (data) => {
        const energyMessage: Message = {
            type: 'energy',
            sender: null,
            text: '',
            timestamp: data.timestamp,
            energyData: data,
        };
        setChat((prevChat) => [...prevChat, energyMessage]);
      });

      socket.on('new_room', (newRoom: Room) => {
        setNewlyCreatedRooms((prevRooms) => [...prevRooms, newRoom]);
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
    if (message !== '' && room) {
      const messageData = {
        room: room.name,
        text: message,
      };
      socket.emit('send_message', messageData);
      setMessage('');
    }
  }, [message, room]);

  const handleRoomCreated = useCallback((newRoom: Room) => {
    setFetchedRooms((prevRooms) => [...prevRooms, newRoom]);
    setNewlyCreatedRooms((prevRooms) => [...prevRooms, newRoom]);
    setSelectedRoom(newRoom);
    setShowCreateRoom(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !room) return;

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
        room: room.name,
        text: data.url,
      };
      socket.emit('send_message', messageData);

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [room, token]);

  return (
    <SocialContext.Provider value={{
      socket,
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
