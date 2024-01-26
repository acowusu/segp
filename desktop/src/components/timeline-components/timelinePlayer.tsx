import { TimelineState } from '@xzdarcy/react-timeline-editor';
import React, { FC, useEffect, useState } from 'react';
import { Button } from '../ui/button';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayer: FC<{
  timelineState: React.RefObject<TimelineState>;
  autoScrollWhenPlay: boolean;
  handlePlayPause: () => void;
}> = ({ timelineState, autoScrollWhenPlay, handlePlayPause }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  const scaleWidth = 160;
  const scale = 1;
  const startLeft = 20;

  useEffect(() => {
    if (!timelineState.current) return;
    const engine = timelineState.current;
    engine.listener.on('play', () => setIsPlaying(true));
    engine.listener.on('paused', () => setIsPlaying(false));
    engine.listener.on('afterSetTime', ({ time }) => setTime(time));
    engine.listener.on('setTimeByTick', ({ time }) => {
      setTime(time);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 250;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current?.setScrollLeft(left)
      }
    });

    return () => {
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
    };
  }, []);

  const handlePlayOrPause = () => {
    if (!timelineState.current) return;
    handlePlayPause();
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  const handleRateChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (!timelineState.current) return;
    const rate = parseFloat(e.target.value);
    timelineState.current.setPlayRate(rate);
  };

  const timeRender = (time: number) => {
    const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
  };

  return (
    <div className='flex w-full'>
      <Button 
        onClick={handlePlayOrPause}
        className='bg-gray-800 text-white'
        >
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <div >{timeRender(time)}</div>
      <div >
        <select 
            onChange={handleRateChange}
            className='bg-gray-800 text-white'
        >
          {Rates.map((rate) => (
            <option key={rate} value={rate}>{`${rate.toFixed(1)} speed`}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimelinePlayer;