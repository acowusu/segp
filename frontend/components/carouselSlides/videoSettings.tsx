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
    <div className='h-[40rem] w-3/5 flex flex-row items-start justify-start border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-[30rem] p-8 h-full flex flex-col gap-4 border-r shadow-2xl shadow-green-600'>
        <h1 className='font-bold text-4xl h-[10%]'>
          Settings
        </h1>
        <div className='text-xl h-[70%] overflow-auto no-scrollbar flex flex-col items-start gap-4'>
          
          {settings.map((settingComponent, index) => (
            <button onClick={() => setSettingChoice(index)} className='text-2xl p-2 font-bold' key={index}>
              {settingComponent.name}
            </button>
          ))}
        </div>
        <button onClick={() => saveSettings()} className='text-lg border rounded-xl w-1/2 p-2 m-2'>Continue</button>
      </div>

      {settings.map((settingComponent, index) => (
            index == settingChoice &&
            <div className="h-full" key={index}>
              {settingComponent.component}
            </div>
          ))}
    </div>
  )
};

export default VideoSettings;