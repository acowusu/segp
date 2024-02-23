import React, { useState, useEffect } from 'react';
import etro from "etro"

export const AvatarGenerator: React.FC = () => {
  const [avatarResponse, setAvatarResponse] = useState<string>('');
  const ttsMockAudioUrl = "/www/sadtalker_assets/driven_audio/full.wav";
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const generateAvatar = async () => {

    try {
        const avatar = await window.api.getProjectAvatar();
        const result = await window.api.generateAvatar(avatar, ttsMockAudioUrl);
        setAvatarResponse(result);
    } catch (error) {
        console.error('Error generating avatar:', error);
    }
  };

  useEffect(() => {

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const movie = new etro.Movie({
      canvas: canvas,
      repeat: true,
      background: etro.parseColor('white'),
    })

    canvas.width = 1920;
    canvas.height = 1080;

    const avatarLayer = new etro.layer.Video({
      startTime: 0,
      duration: 10,
      source: avatarResponse,
    })

    // const avatarChromaKey = new etro.effect.ChromaKey({
    //   target: etro.parseColor('green'),
    //   interpolate: false,
    //   threshold: 10,
    // })

    // avatarLayer.addEffect(avatarChromaKey);
    movie.addLayer(avatarLayer);
    movie.play();
  }, [avatarResponse]);

  return (
    <div>
       <h2>Avatar Gen</h2>
        <button
      style={{
        backgroundColor: 'purple',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}
      onClick={generateAvatar}
    >
      Generate Avatar
    </button>
      <div>
        <canvas className="w-full" ref={canvasRef} />
      </div>
      {/* <video src={avatarResponse} controls /> */}
    </div>
  );
};