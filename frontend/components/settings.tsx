'use client'
import React, { useState } from 'react';
import axios from 'axios';
import useSound from 'use-sound';
import Image from 'next/image';


export const DefaultScreen = () => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Configure your video settings
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are the projects current settings
      </h1>

      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
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

export const AudioSelection = () => {

  const voices = [
    {name: "Alloy", sampleAudio: "/alloy.wav", image: "/alloy.png"},
    {name: "Echo", sampleAudio: "/echo.wav", image: "/echo.png"},
    {name: "Fable", sampleAudio: "/fable.wav", image: "/fable.png"},
    
  ]

  const AudioIcon = ({name, sampleAudio, image}: {name: string, sampleAudio: string, image: string}) => {
    const [playSound] = useSound(sampleAudio);
    return (
      <button onClick={playSound} className='border rounded-xl p-4'>
        <img src={image} alt={name} className="object-cover"/>
      </button>
    )
  }

  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Select Audio
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are a list of voices you can choose from
      </h1>

      <div className='w-full h-full overflow-auto no-scrollbar grid grid-cols-3 gap-8 p-8'>
        {voices.map((voice) => (
          <AudioIcon {...voice}/>
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

export const Subtitles = () => {
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Add subtitles to your project
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Subtitles on/off
      </h1>
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
