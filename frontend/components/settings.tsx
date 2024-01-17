'use client'
import React, { useRef, useState } from 'react';
import axios from 'axios';
import useSound from 'use-sound';
import Image from 'next/image';
import SoundIcon from "../public/soundIcon.svg"
import { settingItems } from './carousel';
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

 

export const DefaultScreen = ({currSettings}: {currSettings: settingItems}) => {

  const OverviewLabel = ({settingTitle, settingItem}: {settingTitle: string, settingItem: any}) => {
    return  (
      <div className='w-full flex flex-row justify-between px-32 text-xl 2xl:text-2xl'>
        <h1>
          {settingTitle}
        </h1>
        <h1>
          {settingItem}
        </h1>
      </div>
    )
  }

  return (
    <div className=' w-full h-full flex flex-col items-center gap-4 2xl:gap-8 p-2'>
      <h1 className='font-bold text-4xl m-4 2xl:m-8'>
        Configure your video settings
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are the projects current settings
      </h1>

      <div className='w-full flex flex-col gap-4 overflow-auto no-scrollbar h-full'>
        <OverviewLabel settingTitle={"Video Length"} settingItem={`${currSettings.videoLength[0]} - ${currSettings.videoLength[1]} minutes`}/>
        <OverviewLabel settingTitle={"Voiceover"} settingItem={currSettings.voice}/>
        <OverviewLabel settingTitle={"Avitar Choice"} settingItem={currSettings.avatar}/>
        <OverviewLabel settingTitle={"Target Audience"} settingItem={currSettings.targetAudience}/>
        <OverviewLabel settingTitle={"Formality"} settingItem={currSettings.formality}/>
        <OverviewLabel settingTitle={"Subtitles"} settingItem={currSettings.subtitles ? "On" : "Off"}/>
      </div>
    </div>
  )
}

export const VideoLength = ({length, setLength}: {length: number[], setLength: (name: number[])=>void}) => {
  
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Video Length
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Select the ideal length of your video
      </h1>

      <div className='w-3/5 m-20 flex flex-col gap-8 items-center'>
        <RangeSlider min={0} max={20} step={1} value={length} onInput={setLength} />
        <h1 className='text-4xl font-bold'>
          Time: {length[0]} - {length[1]} minutes long
        </h1>
        <h1>
          Exactly n minutes?
        </h1>
      </div>
      
    </div>
  )
}

export const AudioSelection = ({selectedVoice, setSelectedVoice}: {selectedVoice: string, setSelectedVoice: (name: string)=>void}) => {

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

export const AvatarSelection = ({selectedAvatar, setSelectedAvatar}: {selectedAvatar: string, setSelectedAvatar: (name: string)=>void}) => {

  const avatars = [
    {name: "None", avatarImgPath: "/alloy.wav"},
    {name: "Alloy", avatarImgPath: "/alloy.wav"},
    {name: "Echo", avatarImgPath: "/echo.wav"},
    {name: "Fable", avatarImgPath: "/fable.wav"},
    {name: "Onyx", avatarImgPath: "/onyx.wav"},
    {name: "Nova", avatarImgPath: "/nova.wav"},
    {name: "Shimmer", avatarImgPath: "/shimmer.wav"},
  ]

  const AvatarIcon = ({name, avatarImgPath}: {name: string, avatarImgPath: string}) => {
    return (
      <div className='w-full h-full flex flex-col gap-2 2xl:gap-4'>
        <button 
          className={`text-2xl 2xl:text-4xl font-bold border h-full rounded-lg p-2 2xl:p-4 flex items-center justify-center ${selectedAvatar == name && "text-green-600 shadow-2xl shadow-green-600"}`}
          onClick={() => setSelectedAvatar(name)}
        >
          {name}
        </button>
      </div>
    )
  }

  return (
    <div className=' w-full h-full flex flex-col items-center gap-2 2xl:gap-8'>
      <h1 className='font-bold text-2xl 2xl:text-4xl m-4 2xl:m-8'>
        Select Avatar
      </h1>
      <h1 className='font-bold text-xl 2xl:text-2xl m-2'>
        Here are a list of avatars to overlay the video
      </h1>

      <div className='w-full h-full overflow-auto no-scrollbar grid grid-cols-3 gap-4 2xl:gap-8 p-8'>
        {avatars.map((avatar, index) => (
          <AvatarIcon {...avatar} key={index}/>
        ))}
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

export const TargetAudience = ({audience, setAudience, formality, setFormality}: {audience: string, setAudience: (type: string)=>void, formality: string, setFormality: (type: string)=>void}) => {

  const AudienceType = ({type, form}: {type: string, form: boolean}) => {
    return (
      <div className='w-full h-full flex flex-col gap-2 2xl:gap-4'>
        <button 
          className={`text-xl 2xl:text-2xl font-bold border h-full rounded-lg p-2 2xl:p-4 flex items-center justify-center ${((!form && audience == type) || (form && formality == type)) && "text-green-600 shadow-2xl shadow-green-600"}`}
          onClick={() => {if (!form) {setAudience(type)} else {setFormality(type)}}}
        >
          {type}
        </button>
      </div>
    )
  }

  const formalities = ["Casual", "Formal", "Consultative", "Intimate"]
  const targetAudience = ["Everyone", "Children", "Adults", "Students", "Accountants", "Engineers", "Scientist", "Stakeholders"]

  return (
    <div className=' w-full h-full flex flex-col items-center gap-4'>
      <h1 className='font-bold text-2xl 2xl:text-4xl m-4'>
        Set the target audience
      </h1>
      
      <div className='w-full h-full overflow-auto no-scrollbar grid grid-cols-4 gap-4 2xl:gap-8 p-4 2xl:p-8'>
      {targetAudience.map((target, index) => (
          <AudienceType type={target} form={false} key={index}/>
        ))}
      </div>
      <h1 className='font-bold text-2xl 2xl:text-4xl'>
        Level of formality
      </h1>
      <div className='w-full h-full overflow-auto no-scrollbar grid grid-cols-4 gap-4 2xl:gap-8 p-8'>
      {formalities.map((formality, index) => (
          <AudienceType type={formality} form={true} key={index}/>
        ))}
        
      </div>
      
    </div>
  )
}
