import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayerWithControls: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayPause = () => {
      
    setIsPlaying(!isPlaying);
    
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    setCurrentTime(progress.playedSeconds);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTo);
    }
  };

  const handleFullScreen = () => {
    if (playerRef.current) {
      playerRef.current.getInternalPlayer()?.requestFullscreen();
    }
  };

  return (
    <div className="w-full p-4 flex flex-col items-center justify-center">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="70%"
        height="80%"
        playing={isPlaying}
        volume={volume}
        onProgress={handleProgress}
      />
      <div className="w-[80%] flex flex-col">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
        <div className='flex flex-row w-full justify-row items-center gap-4'>
          <div className="w-[16rem]">
            {currentTime.toFixed(1)}s / {playerRef.current?.getDuration()?.toFixed(1)}s
          </div>
          <button onClick={handlePlayPause} className='p-2 mx-16 w-2/5'>
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <input
            type="range"
            min="0"
            max={playerRef.current?.getDuration() || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
          />
          <button onClick={handleFullScreen}>Full Screen</button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerWithControls;
