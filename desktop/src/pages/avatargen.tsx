import React, { useState } from 'react';

export const AvatarGenerator: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string>('');
  const [avatar, setAvatar] = useState<{id: string, imagePath: string}>({id: '', imagePath: ''});
  const [avatarResponse, setAvatarResponse] = useState<string | null>(null);
  const ttsMockAudioUrl = "./examples/driven_audio/RD_Radio31_000.wav";
  const mockAvatar = {id: "1", imagePath: "./examples/source_image/art_18.png"}; 

  const generateAvatar = async () => {
    // Assuming window.api.textToAudio returns a promise with the audio URL
    // const [url, id]= await window.api.textToAudio();
    try {
        const result = await window.electronAPI.generateAvatar(mockAvatar, ttsMockAudioUrl);
        setAvatarResponse(result);
    } catch (error) {
        console.error('Error generating avatar:', error);
    }
  };

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
        {avatarResponse && 
            <video controls>
                <source src={avatarResponse} type="video/mp4"/>
            </video>
        }
    </div>
  );
};