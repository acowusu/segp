import React, { useState } from 'react';

interface AudioInfo {
  audioPath: string;
  duration: number;
  text: string;
}

// AudioGenerator passes an array of a script and returns an array of AudioInfo

export const AudioGenerator: React.FC = () => {
  const [audioInfoList, setAudioInfoList] = useState<AudioInfo[]>([]);
  // const script = ["Good Morning I hope you have a lovely day.", "My name is John Cena - you can't see me.", "That's all, good bye world."]
  // const script = ["The sun was setting behind the distant mountains, casting a warm glow over the tranquil valley below. Birds chirped softly in the trees, and a gentle breeze rustled the leaves. As the evening descended, the sky turned into a canvas of vibrant colors, painting the horizon with shades of orange, pink, and purple. It was a peaceful scene, a moment of serenity amidst the chaos of the world."]
  const script = ["The sun was setting behind the distant mountains, casting a warm glow over the tranquil valley below.", "Birds chirped softly in the trees, and a gentle breeze rustled the leaves.", "As the evening descended, the sky turned into a canvas of vibrant colors, painting the horizon with shades of orange, pink, and purple.", "It was a peaceful scene, a moment of serenity amidst the chaos of the world."]

  const generateAudio = async (script: string[]) => {
    try {
      const audioInfoList: AudioInfo[] = await window.electronAPI.textToAudio(script);
      setAudioInfoList(audioInfoList);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  const handleClick = () => {
      generateAudio(script);
  };

  return (
    <div>
      <h2>Text to Audio Generator</h2>
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
      {audioInfoList.length > 0 && (
        <div>
          <p>Generated Audio:</p>
          {audioInfoList.map((audioInfo, index) => (
            <div key={index}>
              <p>Audio {index + 1} Duration: {audioInfo.duration} seconds</p>
              <audio controls>
                <source src={audioInfo.audioPath} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <a href={audioInfo.audioPath} download={`generated_audio_${index}.mp3`}>Download Audio</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
