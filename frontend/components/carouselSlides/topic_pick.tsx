'use client'
import React, { useState } from 'react';
import { topicsProp, scriptsProp } from '../carousel';
import axios from 'axios';

interface TopicProps {
  nextSlide: ()=>void;
  openModal: ()=>void;
  topics: topicsProp;
  setScripts: (scripts: scriptsProp)=>void;
}

const TopicPick: React.FC<TopicProps> = ({nextSlide, openModal, topics, setScripts}) => {

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
    <div className='h-[40rem] flex flex-row items-center justify-center border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
        Select a topic that you would like a video of
        </h1>

        <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
          {
            topics.map(({topic, summary}, index) => (
              <div key={index}>
              <Topic label={topic} selected={index == selectedIndex} index={index}/>
            </div>
            ))
          }
        </div>

        <button onClick={openModal} disabled={false} className='border p-5 rounded-lg'>Video Settings</button>

        <button onClick={() => generateScript(topics[selectedIndex].topic)} disabled={loading || selectedIndex == -1} className='border p-5 disabled:bg-gray-800'>{loading ? "Generating Scripts..." : "Continue"}</button>
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