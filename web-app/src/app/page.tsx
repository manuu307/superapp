"use client";
import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SocialContext, SocialProvider, type SocialContextType } from '../context/SocialContext';
import CreateRoom from '../components/CreateRoom';
import { AuthContext } from '../context/AuthContext';
import { withProtectedRoute } from './withProtectedRoute';
import UserAvatar from '../components/UserAvatar';
import './chat.css';

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

interface AuthContextType {
  user: {
    _id: string;
    username: string;
  } | null;
  token: string | null;
}

const Chat = () => {
  const router = useRouter();
  const [isRoomsVisible, setIsRoomsVisible] = useState(false);
  const socialContext = useContext(SocialContext);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [energyAmount, setEnergyAmount] = useState(0);

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

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
        alert('Audio recording is only supported in secure contexts (HTTPS).');
        return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.ondataavailable = (e) => {
        const audioBlob = e.data;
        const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
        const event = { target: { files: [audioFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(event);
      };
      setIsRecording(false);
    }
  };

  const handleSendEnergy = async () => {
    if (!room || !room.isOneToOne || !user || !socialContext.socket) {
      console.error('Cannot send energy in a group chat or without a user.');
      return;
    }
    const recipient = room.users.find(u => u._id !== user._id);
    if (!recipient) {
      console.error('Recipient not found.');
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}/economy/beam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify({
          recipientId: recipient._id,
          amount: energyAmount,
          currency: 'lumens',
        }),
      });
      socialContext.socket.emit('send_energy_message', {
        room: room.name,
        recipientId: recipient._id,
        amount: energyAmount,
      });
      alert('Energy sent successfully!');
      setShowEnergyModal(false);
    } catch (error) {
      console.error('Error sending energy:', error);
      alert('Failed to send energy.');
    }
  };

  return (
    <div className="chat-container">
      {showEnergyModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded-md shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-bold text-center">Send Energy</h3>
            <input
              type="number"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 mb-4 bg-gray-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button onClick={handleSendEnergy} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700">
              Send
            </button>
            <button onClick={() => setShowEnergyModal(false)} className="w-full px-4 py-2 mt-2 font-bold text-white bg-gray-500 rounded-md hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}
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
            {rooms.map((r) => (
              <li key={r._id} onClick={() => { setRoom(r); setIsRoomsVisible(false); }} className={`p-2 cursor-pointer rounded-md ${r._id === room?._id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {r.isOneToOne ? r.users.find(u => u._id !== user?._id)?.username : r.name}
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
              <h3>{room.isOneToOne ? room.users.find(u => u._id !== user?._id)?.username : room.name}</h3>
              {room && room.isOneToOne && (
                <button
                  onClick={() => setShowEnergyModal(true)}
                  className="px-4 py-2 font-bold text-white bg-yellow-500 rounded-md hover:bg-yellow-700"
                >
                  ⚡️ Send Energy
                </button>
              )}
              {room && (
                <button
                  onClick={() => router.push(`/video/${room.name}`)}
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700"
                >
                  Start Video Call
                </button>
              )}
            </div>
            <div className="chat-messages">
              {chat.map((msg: Message, index: number) => {
                if (msg.type === 'energy' && msg.energyData) {
                  return (
                    <div key={index} className="text-center my-2">
                      <span className="bg-yellow-200 text-green-800 px-2 py-1 rounded-full text-sm">
                        ⚡️ {msg.energyData.sender.username} beamed {msg.energyData.amount} lumens to {msg.energyData.recipient.username}
                      </span>
                    </div>
                  );
                }
                return (
                <div key={index} className={`flex mb-4 items-end ${msg.sender?.username === user?.username ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender?.username !== user?.username && msg.sender && (
                    <div className="mr-2">
                        <Link href={`/profile/${msg.sender._id}`}>
                            <UserAvatar user={msg.sender} />
                        </Link>
                    </div>
                  )}
                  <div className={`p-3 rounded-lg ${msg.sender?.username === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className="text-sm font-bold">
                        {msg.sender ? (
                            <Link href={`/profile/${msg.sender._id}`}>
                                {msg.sender.username}
                            </Link>
                        ) : (
                            'Unknown User'
                        )}
                    </div>
                    <div className="text-lg">
                      {msg.text.startsWith('http://') && (msg.text.endsWith('.jpg') || msg.text.endsWith('.png') || msg.text.endsWith('.gif')) ? (
                        <img src={msg.text} alt="Uploaded content" width={320} height={213} className="max-w-xs rounded-md" />
                      ) : msg.text.endsWith('.wav') ? (
                        <audio controls src={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                  {msg.sender?.username === user?.username && msg.sender && (
                    <div className="ml-2">
                        <Link href={`/profile/${msg.sender._id}`}>
                            <UserAvatar user={msg.sender} />
                        </Link>
                    </div>
                  )}
                </div>
              )})}
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
              <button type="button" onClick={isRecording ? stopRecording : startRecording} className="p-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {isRecording ? '⏹️' : '🎤'}
              </button>
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