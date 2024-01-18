import React, { useState } from 'react';
import * as PlayHT from 'playht';
import { saveAs } from 'file-saver';

const PlayHTComponent = () => {
  const [audioUrl, setAudioUrl] = useState(null);

  const generateAudio = async (text) => {
    try {
      const generated = await PlayHT.generate(text);
      const { audioUrl } = generated;
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const downloadAudio = async () => {
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        saveAs(blob, 'generated_audio.mp3');
      } catch (error) {
        console.error('Error downloading audio:', error);
      }
    }
  };

  return (
    <div>
      <textarea
        placeholder="Enter text..."
        onChange={(e) => generateAudio(e.target.value)}
      />
      <br />
      <button onClick={downloadAudio} disabled={!audioUrl}>
        Download Audio
      </button>
    </div>
  );
};

export default PlayHTComponent;
