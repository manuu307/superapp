"use client";
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface BusinessChatWidgetProps {
  businessId: string;
  enabled: boolean;
}

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

interface GuestSession {
  token: string;
  roomId: string;
  roomName: string;
  guest: {
    _id: string;
    name: string;
    email: string;
  };
}

const BusinessChatWidget: React.FC<BusinessChatWidgetProps> = ({ businessId, enabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<GuestSession | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem(`guestSession_${businessId}`);
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
  }, [businessId]);

  useEffect(() => {
    if (session && isOpen) {
      socketRef.current = io({
        auth: {
          token: session.token,
        },
      });

      socketRef.current.on('connect', () => {
        console.log('connected');
        socketRef.current?.emit('join_room', session.roomName);
      });

      socketRef.current.on('load_history', (history: Message[]) => {
        setChat(history);
      });

      socketRef.current.on('receive_message', (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
      });

      return () => {
        socketRef.current?.off('connect');
        socketRef.current?.off('load_history');
        socketRef.current?.off('receive_message');
        socketRef.current?.disconnect();
      };
    }
  }, [session, isOpen]);

  const handleInitiateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/public/chat/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, businessId }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`guestSession_${businessId}`, JSON.stringify(data));
        setSession(data);
      }
    } catch (error) {
      console.error('Failed to initiate chat', error);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socketRef.current) {
      socketRef.current.emit('send_message', { room: session?.roomName, text: message });
      setMessage('');
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
      >
        Chat
      </button>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-lg shadow-lg border flex flex-col">
          {!session ? (
            <form onSubmit={handleInitiateChat} className="p-4 space-y-4">
              <h3 className="text-lg font-bold">Chat with us!</h3>
              <p>Please fill the form to start chatting.</p>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                Start Chat
              </button>
            </form>
          ) : (
            <>
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold">{session.roomName}</h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {chat.map((msg, i) => (
                  <div key={i} className={`my-2 ${msg.sender === session.guest.email ? 'text-right' : ''}`}>
                    <div className={`inline-block p-2 rounded-lg ${msg.sender === session.guest.email ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      <strong>{msg.sender}: </strong>{msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 p-2 border rounded-l-lg"
                  />
                  <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessChatWidget;
