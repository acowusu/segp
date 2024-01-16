'use client'
import React, { useState } from 'react';
import { topicsProp, scriptsProp, settingItems } from '../carousel';
import axios from 'axios';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface TopicProps {
  nextSlide: ()=>void;
  setModal: (isOpened: boolean, children?: React.ReactNode)=>void;
  topics: topicsProp;
  setScripts: (scripts: scriptsProp)=>void;
  settings: settingItems;
  setSettings: (settings: settingItems) => void;
}

const TopicPick: React.FC<TopicProps> = ({nextSlide, setModal, topics, setScripts, settings, setSettings}) => {
  const modalContents = (
    <div className='text-white'>
        {/* Top Bar with Title and Close Button */}
        <div className="w-full py-4 px-6 flex justify-between items-center">
            <h2 className="text-4xl font-bold">Advanced Options</h2>
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
        <div className="overflow-y-auto no-scrollbar flex flex-col gap-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className='flex justify-between w-full mr-10'>
                <p className='hover:underline'>Choose voice</p>
                <p className='hover:no-underline'>
                  {settings.subtitles ? "On" : "Off"}  
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div>
                voice choices:
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Target Audience</AccordionTrigger>
            <AccordionContent>
              <div>
                Choose audience
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Video Length</AccordionTrigger>
            <AccordionContent>
              Choose Video Length
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Choose Avitar</AccordionTrigger>
            <AccordionContent>
              <div>
                Choose Avitar
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Level of Formality</AccordionTrigger>
            <AccordionContent>
              <div>
                Choose level of formality
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <p>Add Subtitles</p>
          {/* <p>Choose voice</p>
          <p>Choose taget audience</p>
          <p>Choose video length</p>
          <p>Choose overlaying avatar</p>
          <p>Choose level of formality</p>
          <p>Add Subtitles?</p>
          <input className='text-black' placeholder='Add extra info'/> */}
        </div>
        <div className='w-full flex items-center justify-center my-16'>
          <button onClick={() => {}} className='my-2 border p-5 rounded-lg'>
            Save
          </button>
        </div>
    </div>
  )

  const [selectedIndex, setSelectedIndex] = useState(-1)


  const Topic = ({label, selected, index}: {label: string, selected: boolean, index: number}) => {
    return (
      <button onClick={() => setSelectedIndex(index)} className={`w-full text-white p-4 border flex items-center justify-center border-white rounded shadow-md ${selected ? "bg-gray-600" : "hover:bg-gray-800"}`}>
        {label}
      </button>
    )
  }

  const [loading, setLoading] = useState(false);

  async function generateScript(topic: string) {
    setLoading(true)
    
    try {
      const response = await axios.post("/api/generate_script", {data: topic});
      // simulate script being generated
      await new Promise(res => setTimeout(res, 1000));
      if (response.status == 200) {
        setScripts(response.data.scripts) // get from response
        setLoading(false)
        nextSlide()
      } else {
        console.log("ERROR ERROR ERROR TODO TODO TODO")
      }

    } catch {
      console.log("ERROR ERROR ERROR")
    }
  }

  return (
    <div className='h-full w-full flex flex-row items-center justify-center border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
        Select a topic that you would like a video of
        </h1>

        <div className='flex flex-col flex-grow gap-4 overflow-auto no-scrollbar h-2/5'>
          {
            topics.map(({topic, summary}, index) => (
              <div key={index}>
              <Topic label={topic} selected={index == selectedIndex} index={index}/>
            </div>
            ))
          }
        </div>

        <button onClick={() => generateScript(topics[selectedIndex].topic)} disabled={loading || selectedIndex == -1} className='border p-4 rounded-lg m-4  disabled:bg-gray-800'>{loading ? "Generating Scripts..." : "Continue"}</button>
      </div>

      {/* Setting view */}

      <div className=' w-[30rem] p-8 h-full flex flex-col gap-4 border-l-2 shadow-2xl shadow-red-700'>
        <h1 className='font-bold text-4xl'>
          Chosen Topic
        </h1>
        <div className='text-xl'>
          {selectedIndex == -1 ? "Please select a topic for the video" : topics[selectedIndex].topic}
        </div>

        <h1 className='font-bold text-4xl'>
          Summary
        </h1>
        <div className='overflow-auto no-scrollbar'>
          {selectedIndex == -1 ? "..." : topics[selectedIndex].summary}
        </div>

      </div>

    </div>
  )
};

export default TopicPick;