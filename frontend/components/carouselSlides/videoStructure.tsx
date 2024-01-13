'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';

interface VideoStructureProps {
  callback: () => void;
  openModal: () => void;
  scripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, openModal, scripts}) => {
  console.log(scripts)
  const ScriptBox = ({label}: {label: string}) => {
    return (
      <div className='text-white p-4 border w-1/2 border-white rounded shadow-md overflow-auto no-scrollbar'>
        {label}
      </div>
    )
  }

  const [sectionIndex, setSectionIndex] = useState(0)

  return (
    <div className='w-3/5 h-[40rem] flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center'>
        <h1 className='font-bold text-4xl m-8'>
          Structure of Video
        </h1>
        {
          scripts.length != 0 &&
          scripts.map(({section, script1, script2}, index) => (
            sectionIndex == index &&
            <div className='w-full h-full flex flex-col items-center gap-8'>
               <div className='flex items-center justify-center'>
                <button disabled={sectionIndex == 0} onClick={() => setSectionIndex(prev => prev - 1)} className='p-4 border rounded-lg mx-4 disabled:bg-gray-700'>back</button>
                <h1 className='font-bold border border-white text-xl p-4'>
                  {section}
                </h1>
                <button disabled={sectionIndex == scripts.length - 1} onClick={() => setSectionIndex(prev => prev + 1)} className='p-4 border rounded-lg mx-4 disabled:bg-gray-700'>next</button>
              </div>

              <div className='max-h-[60%] max-w-[80%] flex flex-row gap-4 overflow-auto no-scrollbar h-2/5'>
                <ScriptBox label={script1}/>
                <ScriptBox label={script2}/>
              </div>

            </div>   
          ))
        }
       
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