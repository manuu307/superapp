'use client';
import React, { useEffect, useState } from 'react';
import { Track } from '../../types';
import UploadSongModal from '../../components/UploadSongModal';
import MusicPlayer from '../../components/MusicPlayer';

const MusicMarketplacePage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string>('');

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/v1/music/marketplace');
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleUploadSuccess = () => {
    fetchTracks();
  };

  const getPresignedUrl = async (trackId: string) => {
    try {
      const response = await fetch(`/api/v1/music/${trackId}/preview`);
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error fetching presigned URL:', error);
      return '';
    }
  }

  const handlePlayTrack = async (trackId: string) => {
    const url = await getPresignedUrl(trackId);
    setCurrentTrackUrl(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Music Marketplace</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload Song
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {tracks.map((track) => (
          <div key={track._id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">{track.title}</h2>
            <p className="text-gray-600 mb-2">by {track.authorId.username}</p>
            <p className="text-gray-800 font-bold">{track.priceEnergy} Energy</p>
            <button
              onClick={() => handlePlayTrack(track._id)}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Play
            </button>
          </div>
        ))}
      </div>
      {currentTrackUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
          <MusicPlayer trackUrl={currentTrackUrl} />
        </div>
      )}
      <UploadSongModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default MusicMarketplacePage;