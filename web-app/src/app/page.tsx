"use client";
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { SocialContext, SocialProvider, type SocialContextType } from '../context/SocialContext';
import CreateRoom from '../components/CreateRoom';
import { AuthContext } from '../context/AuthContext';

interface Message {
  sender: string;
  text: string;
  timestamp: string; // Assuming timestamp is a string, could be Date
}

interface AuthContextType {
  user: { username: string } | null;
  token: string | null;
}


const Chat = () => {
  const router = useRouter();
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
  } = useContext(SocialContext) as SocialContextType;
  const { user, token } = useContext(AuthContext) as AuthContextType;

  return (
    <div className="flex h-full">
      <div className="flex flex-col w-1/4 p-4 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="mb-4 text-xl font-bold">Rooms</h2>
        <button onClick={() => setShowCreateRoom(!showCreateRoom)} className="w-full px-4 py-2 mb-4 font-bold text-white bg-green-500 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-900">
          {showCreateRoom ? 'Cancel' : 'Create Room'}
        </button>
        {showCreateRoom && <CreateRoom token={token} onRoomCreated={handleRoomCreated} />}
        <ul className="overflow-y-auto">
          {rooms.map((r: string) => (
            <li key={r} onClick={() => setRoom(r)} className={`p-2 cursor-pointer rounded-md ${r === room ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {r}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col flex-1">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">{room}</h3>
          {room && (
            <button 
              onClick={() => router.push(`/video/${room}`)} 
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700"
            >
              Start Video Call
            </button>
          )}
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
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
        </div>
        <form className="flex p-4 border-t border-gray-200 dark:border-gray-700" onSubmit={sendMessage}>
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
      </div>
    </div>
  );
}


import { withProtectedRoute } from './withProtectedRoute';

const SocialPage = () => {
  return (
    <SocialProvider>
      <Chat />
    </SocialProvider>
  );
};

export default withProtectedRoute(SocialPage);
