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

  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);
  
  useEffect(() => {
    setSectionScriptChoice(Array(scripts.length).fill(-1))
  }, [scripts])

  const modalContents = (
    <div className='h-full'>
        {/* Top Bar with Title and Close Button */}
        <div className="w-full py-4 px-6 flex justify-between items-center">
            <h2 className="text-4xl font-bold text-white">Edit the script!</h2>
            <button onClick={() => setModal(false)} className="text-gray-600 hover:text-black focus:outline-none">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
        <hr className="mt-4 mb-8"/>
        <div className='flex flex-row gap-8 justify-center items-center h-4/5 overflow-auto no-scrollbar text-white'>
          <div className='w-[40%] h-full'>
            <h1 className='font-bold text-4xl my-2'>
              Old Script
            </h1>
            <div className='border-white border rounded-lg h-3/5 p-4'>
              {sectionScriptChoice[sectionIndex] != -1 && (sectionScriptChoice[sectionIndex] == 1 ? scripts[sectionIndex]?.script1 : scripts[sectionIndex]?.script2)}
            </div>
          </div>
          <div className='w-[40%] h-full'>
            <h1 className='font-bold text-4xl my-2'>
              New Script
            </h1>
            <div className='border-white border rounded-lg h-3/5 p-4'>
              hi
            </div>
          </div>
        </div>
        
    </div>
  )




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
            <div key = "Structure" className='w-full h-full flex flex-col justify-center gap-8 items-center'>
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
              <button onClick={() => setModal(true, modalContents)} disabled={false} className='my-2 border p-5 rounded-lg disabled:bg-gray-700'>
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