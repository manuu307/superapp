'use client';

import React, { useState, useEffect } from 'react';
import { Howl } from 'howler';

interface MusicPlayerProps {
  trackUrl: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ trackUrl }) => {
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (trackUrl) {
      const newSound = new Howl({
        src: [trackUrl],
        html5: true,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onend: () => setIsPlaying(false),
      });
      setSound(newSound);

      return () => {
        newSound.unload();
      };
    }
  }, [trackUrl]);

  const togglePlay = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    }
  };

  return (
    <div>
      <button onClick={togglePlay} className="text-white">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default MusicPlayer;
