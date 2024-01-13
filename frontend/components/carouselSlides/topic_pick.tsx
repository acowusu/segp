'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { topics } from '../carousel';

interface TopicProps {
  nextSlide: ()=>void;
  openModal: ()=>void;
  topics: topics;
}

const TopicPick: React.FC<TopicProps> = ({nextSlide, openModal, topics}) => {


  const Topic = ({label}: {label: string}) => {
    return (
      <div className='text-white p-4 border flex items-center justify-center border-white rounded shadow-md'>
        {label}
      </div>
    )
  }

  const [loading, setLoading] = useState(false);

  async function generateScript(topic: string) {
    setLoading(true)
      // simulate script being generated
      await new Promise(res => setTimeout(res, 5000));

      try {
        setLoading(false)
        nextSlide()
      } catch {
        console.log("ERROR ERROR ERROR")
      }
  }

  return (
    <div className='w-3/5 h-[40rem] flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
        Select a topic that you would like a video of
        </h1>

        <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
          {
            topics.map(({topic, summary}, index) => (
            <div key={index}>
              <Topic label={topic} />
            </div>
            ))
          }
        </div>

        <button onClick={openModal} disabled={false} className='border p-5 rounded-lg'>Advanced</button>

        <button onClick={() => generateScript("Architecture of AlexNet")} disabled={loading} className='border p-5 disabled:bg-gray-800'>{loading ? "Processing..." : "Continue"}</button>
      </div>

    </div>
  )
};

export default TopicPick;