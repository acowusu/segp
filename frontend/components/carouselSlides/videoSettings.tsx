'use client'
import React, { useState } from 'react';
import { topicsProp, scriptsProp, settingItems } from '../carousel';
import axios from 'axios';
import { AudioSelection, AvatarSelection, DefaultScreen, Subtitles, TargetAudience } from '../settings';


const VideoSettings = () => {

  const [settingChoice, setSettingChoice] = useState(0)

  const settings = [
  {name: "Overview", component: <DefaultScreen />},
  {name: "Voiceover voice", component: <AudioSelection />},
  {name: "Avatar overlay", component: <AvatarSelection />},
  {name: "Subtitles", component: <Subtitles />},
  {name: "Target Audience", component: <TargetAudience />},
]






  const SettingOption = ({setting, index}: {setting: string, index: number}) => {
    return (
      <button onClick={() => setSettingChoice(index)} className='text-2xl p-2 font-bold'>
        {setting}
      </button>
    )
  }

  function saveSettings() {

  }

  return (
    <div className='w-full h-full grid grid-cols-5 items-center justify-center border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className='col-span-1 p-8 h-full flex flex-col gap-4 border-r shadow-2xl shadow-green-600 overflow-auto'>
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
      <div className='col-span-4'>
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