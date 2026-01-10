"use client";
import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocialContext, SocialProvider, type SocialContextType } from '../context/SocialContext';
import CreateRoom from '../components/CreateRoom';
import { AuthContext } from '../context/AuthContext';
import { withProtectedRoute } from './withProtectedRoute';
import './chat.css';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

interface AuthContextType {
  user: { username: string } | null;
  token: string | null;
}

const Chat = () => {
  const router = useRouter();
  const [isRoomsVisible, setIsRoomsVisible] = useState(false);
  const socialContext = useContext(SocialContext);

  if (!socialContext) {
    return <div>Loading...</div>;
  }

  const {
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
  } = socialContext;
  
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div>Loading...</div>;
  }

  const { user, token } = authContext;
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  return (
    <div className="chat-container">
      { isRoomsVisible ? (
        <div className="rooms-list md:flex flex inset-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Rooms</h2>
          </div>
          <button onClick={() => setShowCreateRoom(!showCreateRoom)} className="w-full px-4 py-2 mb-4 font-bold text-white bg-green-500 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-900">
            {showCreateRoom ? 'Cancel' : 'Create Room'}
          </button>
          {showCreateRoom && <CreateRoom token={token} onRoomCreated={handleRoomCreated} />}
          <ul>
            {rooms.map((r: string) => (
              <li key={r} onClick={() => { setRoom(r); setIsRoomsVisible(false); }} className={`p-2 cursor-pointer rounded-md ${r === room ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      ):
      (
        <></>
      )
      }
      <div className="chat-screen">
        {room ? (
          <>
            <div className="chat-header">
              <button onClick={() => setIsRoomsVisible(!isRoomsVisible)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <h3>{room}</h3>
              {room && (
                <button
                  onClick={() => router.push(`/video/${room}`)}
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700"
                >
                  Start Video Call
                </button>
              )}
            </div>
            <div className="chat-messages">
              {chat.map((msg: Message, index: number) => (
                <div key={index} className={`flex mb-4 ${msg.sender === user?.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg ${msg.sender === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className="text-sm font-bold">{msg.sender}</div>
                    <div className="text-lg">
                      {msg.text.startsWith('http://') && (msg.text.endsWith('.jpg') || msg.text.endsWith('.png') || msg.text.endsWith('.gif')) ? (
                        <img src={msg.text} alt="Uploaded content" width={320} height={213} className="max-w-xs rounded-md" />
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 mr-2 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
              <input type="file" id="file-input" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="file-input" className="p-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">📎</label>
              <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">Send</button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-xl">Pick a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

const SocialPage = () => {
  return (
    <SocialProvider>
      <Chat />
    </SocialProvider>
  );
}

export default withProtectedRoute(SocialPage);