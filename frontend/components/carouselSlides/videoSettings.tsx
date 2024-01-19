'use client'
import React, { useState } from 'react';
import { settingItems } from '../carousel';
import axios from 'axios';
import { AudioSelection, AvatarSelection, DefaultScreen, Subtitles, TargetAudience, VideoLength } from '../settings';

interface VideoSettingProps {
  currSettings: settingItems;
  setSettings: (settings: settingItems) => void;
  nextSlide: ()=>void;
}


const VideoSettings = ({currSettings, setSettings, nextSlide} : VideoSettingProps) => {

  const [settingChoice, setSettingChoice] = useState(0)

  function setSettingVoice(name: string) {
    setSettings({
      ...currSettings,
      voice: name,
    });
  }
  function setSettingAvatar(name: string) {
    setSettings({
      ...currSettings,
      avatar: name,
    });
  }
  function toggleSubtitleState(state: boolean) {
    setSettings({
      ...currSettings,
      subtitles: state
    });
  }
  function setFormality(formality: string) {
    setSettings({
      ...currSettings,
      formality: formality
    });
  }
  function setAudience(type: string) {
    setSettings({
      ...currSettings,
      targetAudience: type
    });
  }
  function setLength(length: number[]) {
    setSettings({
      ...currSettings,
      videoLength: length
    });
  }


  const settings = [
  {name: "Overview", component: <DefaultScreen currSettings={currSettings}/>},
  {name: "Video Length", component: <VideoLength length={currSettings.videoLength} setLength={setLength}/>},
  {name: "Voiceover audio", component: <AudioSelection selectedVoice={currSettings.voice} setSelectedVoice={setSettingVoice}/>},
  {name: "Avatar overlay", component: <AvatarSelection selectedAvatar={currSettings.avatar} setSelectedAvatar={setSettingAvatar}/>},
  {name: "Subtitles", component: <Subtitles subtitlesState={currSettings.subtitles} toggleSubtitleState={toggleSubtitleState}/>},
  {name: "Target Audience", component: <TargetAudience setAudience={setAudience} setFormality={setFormality} audience={currSettings.targetAudience} formality={currSettings.formality}/>},
]

  const SettingOption = ({setting, index}: {setting: string, index: number}) => {
    return (
      <button onClick={() => setSettingChoice(index)} className='text-2xl p-2 font-bold'>
        {setting}
      </button>
    )
  }

  function saveSettings() {
    nextSlide()
  }

  return (
    <div className='w-full h-full flex flex-row items-center justify-center border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className='basis-1/4 p-8 h-full flex flex-col gap-4 border-r shadow-2xl shadow-green-600 overflow-auto'>
        <h1 className='font-bold text-2xl 2xl:text-4xl'>
          Settings
        </h1>
        <div className='text-xl overflow-auto no-scrollbar flex flex-col items-start gap-4 2xl:text-2xl'>
          {settings.map((settingComponent, index) => (
            <button onClick={() => setSettingChoice(index)} 
              className={`text-lg 2xl:text-xl p-2 font-bold hover:underline ${index == settingChoice && "text-green-600"}`}
              style={{ textAlign: 'left', whiteSpace: 'normal' }}
              key={index}>
                {settingComponent.name}
            </button>
          ))}
        </div>
        <button onClick={() => saveSettings()} className='text-lg border rounded-xl p-2 m-2'>Continue</button>
      </div>
      <div className='basis-3/4  h-full'>
        {settings.map((settingComponent, index) => (
          index == settingChoice &&
          <div className="h-full w-full flex" key={index}>
                {settingComponent.component}
              </div>
            ))}
      </div>
    </div>
  )
};

export default VideoSettings;