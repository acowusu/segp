import React, { useState, useEffect } from 'react';

export const AudioGenerator: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const text = "testing"

  const generateAudio = async (text: string) => {
    // Assuming window.api.textToAudio returns a promise with the audio URL
    // const [url, id]= await window.api.textToAudio();
    try {
        const result = await window.electronAPI.textToAudio(text);
        setAudioUrl(result);
    } catch (error) {
        console.error('Error generating audio:', error);
    }
  };

  const handleClick = () => {
      generateAudio(text);
  };

  return (
    <div>
        <h2>Text to Audio Generator</h2>
        <p>Here is the text you gave me: {text}</p>
        <button 
      style={{ 
        backgroundColor: 'purple', 
        color: 'white', 
        border: 'none', 
        cursor: 'pointer' 
      }} 
      onClick={handleClick}
    >
      Generate Audio
    </button>
        {audioUrl && <p>Generated Audio URL: {audioUrl}</p>}
    </div>
  );
};