import React, { useState } from 'react';

export const AudioGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateAudio = async () => {
      // Assuming window.api.textToAudio returns a promise with the audio URL
      const [url, id]= await window.api.textToAudio();
      
      // Assuming the result object has an audioUrl field
      setAudioUrl(url);
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
      />
      <button onClick={generateAudio}>Generate Audio</button>
      {audioUrl && <audio controls src={audioUrl} />}
    </div>
  );
};
