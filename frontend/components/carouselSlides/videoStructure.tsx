'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';

interface VideoStructureProps {
  callback: () => void;
  openModal: () => void;
  scripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, openModal, scripts}) => {

  const ScriptBox = ({label}: {label: string}) => {
    return (
      <div className='text-white p-4 border w-1/2 border-white rounded shadow-md overflow-auto no-scrollbar'>
        {label}
      </div>
    )
  }

  return (
    <div className='w-3/5 h-[40rem] flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
          Structure of Video
        </h1>

        <h1 className='font-bold border border-white text-xl p-4'>
          Video Part - eg. future predictions (will be able to choose between sections of script)
        </h1>

        <div className='max-h-[60%] max-w-[80%] flex flex-row gap-4 overflow-auto no-scrollbar h-2/5'>
          <ScriptBox label="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
          <ScriptBox label="Here you can choose between which script you want to use for that specific part."/>
        </div>
        <button onClick={callback} disabled={false} className='border p-5 rounded-lg'>
          <a href='./'>
            Create Video
          </a>  
        </button>
      </div>

    </div>
  )
};

export default VideoStructure;