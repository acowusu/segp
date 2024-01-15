'use client'
import React, { TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';
import TextArea from '../textarea';

interface VideoStructureProps {
  callback: () => void;
  setModal: (isOpened: boolean, children?: React.ReactNode)=>void;
  scripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, setModal, scripts}) => {

  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    if (sectionScriptChoice.length == 0) {
      setSectionScriptChoice(Array(scripts.length).fill(-1))
    }
  }, [scripts])

  function updateScripts(content: string) {
    if (sectionScriptChoice[sectionIndex] == 1) {
      scripts[sectionIndex].script1 = content
    } else {
      scripts[sectionIndex].script2 = content
    }
    setModal(false)
  }

  const modalContents = (
    <div className='h-full text-white'>
        {/* Top Bar with Title and Close Button */}
        <div className="w-full h-[10%] py-4 px-6 flex justify-between items-center">
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
        <hr className="mt-4 mb-8 h-1"/>
        <div className='flex flex-row gap-8 justify-center items-center h-[70%] overflow-auto no-scrollbar'>
          <div className='w-[40%] h-full'>
            <h1 className='font-bold text-4xl my-2'>
              Old Script
            </h1>
            <div className='border-white border rounded-lg h-4/5 p-4 shadow-xl shadow-red-600'>
              {sectionScriptChoice[sectionIndex] != -1 && (sectionScriptChoice[sectionIndex] == 1 ? scripts[sectionIndex]?.script1 : scripts[sectionIndex]?.script2)}
            </div>
          </div>
          <div className='w-[40%] h-full'>
            <h1 className='font-bold text-4xl my-2'>
              New Script
            </h1>
            <div className='border-white border rounded-lg h-4/5 p-4 shadow-xl shadow-green-600'>
              <textarea 
              className='bg-inherit w-full h-full overflow-auto no-scrollbar focus:border-none focus:outline-none'
              ref={textareaRef}
              placeholder='Enter your ammended script here'
              style={{ resize: 'none' }}
              />
              
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center w-full'>
          <button onClick={() => updateScripts(textareaRef.current?.value??"")} className='my-2 border p-5 rounded-lg'>
            Save
          </button>
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
      className={`text-white p-4 border w-1/2 border-white rounded  overflow-auto no-scrollbar hover:cursor-pointer  ${selected ? "bg-blue-600" : "hover:bg-gray-800"}`}>
        {label}
      </div>
    )
  }

  return (
    <div className='w-full h-full grid grid-cols-5 items-center justify-center border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className='col-span-1 p-8 h-full flex flex-col gap-4 border-r shadow-2xl shadow-blue-600 overflow-auto'>
        <h1 className='font-bold text-2xl 2xl:text-4xl'>
          Structure
        </h1>
        <div className='h-full overflow-auto no-scrollbar flex flex-col justify-start items-start gap-4'>
          {scripts.map(({section, script1, script2}, index) => (
            <button onClick={() => setSectionIndex(index)}
            className={`text-lg 2xl:text-xl p-2 font-bold hover:underline ${index == sectionIndex && "text-blue-400"}`}
            style={{ textAlign: 'left', whiteSpace: 'normal' }}
            key={index}
             >
              {section}
            </button>
          ))}
        </div>
      </div>

      <div className='col-span-4 h-full flex flex-col items-center'>
        {
          scripts.length != 0 &&
          scripts.map(({section, script1, script2}, index) => (
            sectionIndex == index &&
            <div key = "Structure" className='w-full h-full flex flex-col justify-center gap-8 items-center'>
               <div className='flex items-center justify-center'>
                <h1 className='font-bold text-4xl p-4'>
                  {section}
                </h1>
              </div>
              <div className='w-4/5 flex flex-grow gap-4 overflow-auto no-scrollbar'>
                <ScriptBox label={script1} selected={sectionScriptChoice[index] == 1} index={index} boxNumber={1}/>
                <ScriptBox label={script2} selected={sectionScriptChoice[index] == 2} index={index} boxNumber={2}/>
              </div>
              <button onClick={() => setModal(true, modalContents)} disabled={sectionScriptChoice[index] == -1} className='my-2 border p-5 rounded-lg disabled:bg-gray-700'>
                Edit selected script
              </button>
            </div>   
          ))
        }
        <button onClick={callback} disabled={sectionScriptChoice.some(item => item == -1)} className='border p-5 rounded-lg disabled:bg-gray-700 m-4'>
          Create Video
        </button>
      </div>

    </div>
  )
};

export default VideoStructure;