'use client'
import React, { TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';
import TextArea from '../textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../videoSlideAccordian';







interface VideoStructureProps {
  callback: () => void;
  setModal: (isOpened: boolean, children?: React.ReactNode)=>void;
  allScripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, setModal, allScripts}) => {

  console.log(allScripts)

  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);


  useEffect(() => {
    if (sectionScriptChoice.length == 0) {
      setSectionScriptChoice(Array(allScripts.length).fill(0))
    }
  }, [allScripts])

  function updateScripts(content: string, innerIndex: number) {
    console.log(sectionIndex)
    console.log(innerIndex)
    console.log(sectionScriptChoice[sectionIndex])
    allScripts[sectionIndex].scripts[innerIndex] = content
  }

  
  const updateElement = (index: number, value: number) => {
    
    const newArray = [...sectionScriptChoice]; 
    newArray[index] = value; 
    setSectionScriptChoice(newArray); 
  };


  return (
    <div className='flex flex-row h-full border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className='p-8 basis-1/4 h-full flex flex-col gap-4 border-r shadow-2xl shadow-blue-600'>
        <h1 className='font-bold text-2xl 2xl:text-4xl'>
          Structure
        </h1>
        <div className='h-full overflow-auto no-scrollbar flex flex-col justify-start items-start gap-2 2xl:gap-4'>
          {allScripts.map(({section, scripts}, index) => (
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

      <div className='basis-3/4 h-full flex flex-col p-4 gap-8 items-center overflow-auto no-scrollbar'>
        {
          allScripts.length != 0 &&
          allScripts.map(({section, scripts}, index) => (

            <div 
            key={index}
            onFocus={() => setSectionIndex(index)}
            className={`w-4/5 h-2/5 p-4 2xl:p-8 flex-shrink-0 border bg-zinc-800 rounded-lg overflow-auto no-scrollbar hover:bg-gray-800 ${index == sectionIndex && "shadow-lg shadow-blue-600 border-2 border-blue-400"}`}>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger >
                  <div className="w-full flex items-center justify-end text-neutral-400 text-xs 2xl:text-sm font-normal font-['Inter'] mb-4 hover:cursor-pointer">
                    View other Drafts
                  </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-row gap-4 2xl:gap-8 overflow-auto'>
                      {
                        allScripts[index].scripts.map((content, innerIndex) => (
                          <div 
                          key={innerIndex} 
                          onClick={() => {updateElement(index, innerIndex); updateScripts(scripts[innerIndex], innerIndex)}}
                          className={`hover:cursor-pointer border-2 h-[6rem] rounded-lg p-4 ${innerIndex == sectionScriptChoice[index] && "border-blue-400"} overflow-auto no-scrollbar`}>
                            {content}
                          </div>
                        ))
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion> 
              <blockquote contentEditable="true" onBlur={(event) => updateScripts(event.target.textContent ?? "", sectionScriptChoice[index])} suppressContentEditableWarning={true}>
                {scripts[sectionScriptChoice[index]]}
              </blockquote>
            </div>

          ))
        }
        <button onClick={callback} disabled={sectionScriptChoice.some(item => item == -1)} className='border p-2 2xl:p-5 rounded-lg disabled:bg-gray-700'>
          Create Video
        </button>
        
      </div>
    </div>
  )
};

export default VideoStructure;