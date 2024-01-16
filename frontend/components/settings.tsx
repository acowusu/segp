'use client'
import React, { useState } from 'react';
import axios from 'axios';
import useSound from 'use-sound';
import Image from 'next/image';
import SoundIcon from "../public/soundIcon.svg"

export const DefaultScreen = () => {

  const OverviewLabel = () => {
    return  (
      <div className='w-full flex justify-between mx-32'>
        hi
      </div>
    )
  }

  return (
    <div className=' w-full h-full flex flex-col items-center gap-8 p-2'>
      <h1 className='font-bold text-4xl m-8'>
        Configure your video settings
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are the projects current settings
      </h1>

      <div className='w-full border flex flex-col gap-4 overflow-auto no-scrollbar h-full'>
        <OverviewLabel />
      </div>
      
    </div>
  )
}

export const VideoLength = () => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Video Length
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Select the ideal length of your video
      </h1>

      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
      </div>
      
    </div>
  )
}

export const AudioSelection = ({selectedVoice, setSelectedVoice}: {selectedVoice: string, setSelectedVoice: (index: string)=>void}) => {

  const voices = [
    {name: "Alloy", sampleAudio: "/alloy.wav"},
    {name: "Echo", sampleAudio: "/echo.wav"},
    {name: "Fable", sampleAudio: "/fable.wav"},
    {name: "Onyx", sampleAudio: "/onyx.wav"},
    {name: "Nova", sampleAudio: "/nova.wav"},
    {name: "Shimmer", sampleAudio: "/shimmer.wav"},
  ]

  const AudioIcon = ({name, sampleAudio}: {name: string, sampleAudio: string}) => {
    const [playSound] = useSound(sampleAudio);
    return (
      <div className='w-full h-full flex flex-col gap-2 2xl:gap-4'>
        <button 
          className={`text-2xl 2xl:text-4xl font-bold border rounded-lg p-2 2xl:p-4 flex items-center justify-center ${selectedVoice == name && "text-green-600 shadow-2xl shadow-green-600"}`}
          onClick={() => setSelectedVoice(name)}
        >
          {name}
          </button>
          <button onClick={playSound} className='border rounded-xl p-4 w-full flex items-center justify-between'>
            <span>Sample {name}</span>
            <div className="flex-shrink-0">
              <Image src={SoundIcon} alt='sound icon' width={24} height={24} />
            </div>
          </button>
      </div>
    )
  }

  return (
    <div className=' w-full h-full flex flex-col items-center gap-2 2xl:gap-8'>
      <h1 className='font-bold text-2xl 2xl:text-4xl m-4 2xl:m-8'>
        Select Audio
      </h1>
      <h1 className='font-bold text-xl 2xl:text-2xl m-2'>
        Here are a list of voices you can choose from
      </h1>

      <div className='w-full h-full overflow-auto no-scrollbar grid grid-cols-3 gap-4 2xl:gap-8 p-8'>
        {voices.map((voice, index) => (
          <AudioIcon {...voice} key={index}/>
        ))}
      </div>
    </div>
  )
}

export const AvatarSelection = () => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Add an avatar
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are some overlaying avatars you can add to your video
      </h1>

      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
      </div>
      
    </div>
  )
}

export const Subtitles = ({subtitlesState, toggleSubtitleState}: {subtitlesState: boolean, toggleSubtitleState: (state: boolean)=>void}) => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Add subtitles to your project
      </h1>
      <div className='flex flex-row w-full justify-between px-32 font-bold text-3xl'>
        <h1>
          Subtitles 
        </h1>
        <div>
          <span onClick={() => toggleSubtitleState(true)} className={`${subtitlesState && "text-green-600"} hover:underline`}>on</span>
          /
          <span onClick={() => toggleSubtitleState(false)}className={`${!subtitlesState && "text-green-600"} hover:underline`}>off</span>
        </div>
      </div>
      <h1 className='font-bold text-2xl m-2'>
        Subtitles style
      </h1>
      
      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
      </div>
      
    </div>
  )
}

export const TargetAudience = () => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Set the target audience
      </h1>
      

      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
      </div>
      
    </div>
  )
}
