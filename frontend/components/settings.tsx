'use client'
import React, { useState } from 'react';
import axios from 'axios';

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
  return (
    <div className=' w-full h-full flex flex-col items-center gap-8'>
      <h1 className='font-bold text-4xl m-8'>
        Select Audio
      </h1>
      <h1 className='font-bold text-2xl m-2'>
        Here are a list of voices you can choose from
      </h1>

      <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
        
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
        On Off
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







// <div className='col-span-1 p-8 h-full flex flex-col gap-4 border-r shadow-2xl shadow-blue-600 overflow-auto'>
//         <h1 className='font-bold text-2xl 2xl:text-4xl'>
//           Structure
//         </h1>
//         <div className='h-full overflow-auto no-scrollbar flex flex-col justify-start items-start gap-4'>
//           {scripts.map(({section, script1, script2}, index) => (
//             <button onClick={() => setSectionIndex(index)}
//             className='text-lg 2xl:text-xl p-2 font-bold hover:underline'
//             style={{ textAlign: 'left', whiteSpace: 'normal' }}
//             key={index}
//              >
//               {section}
//             </button>
//           ))}
//         </div>
//         <button className='text-lg border rounded-xl p-2 m-2'>Continue</button>
//       </div>