'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';

interface VideoStructureProps {
  callback: () => void;
  setModal: (isOpened: boolean, children?: React.ReactNode)=>void;
  scripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, setModal, scripts}) => {

  const updateElement = (index: number, value: number) => {
    const newArray = [...sectionScriptChoice]; 
    newArray[index] = value; 
    setSectionScriptChoice(newArray); 
  };


  const ScriptBox = ({label, selected, index, boxNumber}: {label: string, selected: boolean, index: number, boxNumber: number}) => {
    return (
      <div 
      onClick={() => updateElement(index, boxNumber)}
      className={`text-white p-4 border w-1/2 border-white rounded shadow-md overflow-auto no-scrollbar hover:cursor-pointer  ${selected ? "bg-green-400" : "hover:bg-gray-800"}`}>
        {label}
      </div>
    )
  }

  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);
  useEffect(() => {
    setSectionScriptChoice(Array(scripts.length).fill(-1))
  }, [scripts])

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
            <div className='w-full h-full flex flex-col justify-center gap-8 items-center'>
               <div className='flex items-center justify-center'>
                <button disabled={sectionIndex == 0} onClick={() => setSectionIndex(prev => prev - 1)} className='p-4 border rounded-lg mx-4 disabled:bg-gray-700'>back</button>
                <h1 className='font-bold border border-white text-xl p-4'>
                  {section}
                </h1>
                <button disabled={sectionIndex == scripts.length - 1} onClick={() => setSectionIndex(prev => prev + 1)} className='p-4 border rounded-lg mx-4 disabled:bg-gray-700'>next</button>
              </div>
              <div className='max-h-[60%] max-w-[80%] flex flex-grow gap-4 overflow-auto no-scrollbar h-2/5'>
                <ScriptBox label={script1} selected={sectionScriptChoice[index] == 1} index={index} boxNumber={1}/>
                <ScriptBox label={script2} selected={sectionScriptChoice[index] == 2} index={index} boxNumber={2}/>
              </div>
              <button onClick={callback} disabled={true} className='my-2 border p-5 rounded-lg disabled:bg-gray-700'>
                Edit selected script
              </button>
            </div>   
          ))
        }
        <button onClick={callback} disabled={sectionScriptChoice.some(item => item == -1)} className='border p-5 rounded-lg disabled:bg-gray-700'>
          <a href='./'>
            Create Video
          </a>  
        </button>
      </div>

    </div>
  )
};

export default VideoStructure;