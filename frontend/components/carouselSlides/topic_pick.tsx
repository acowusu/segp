'use client'
import React, { useState } from 'react';
import Image from 'next/image';



const TopicPick: React.FC<{callback: () => void, openModal: () => void}> = ({callback, openModal}) => {

  const Topic = ({label}: {label: string}) => {
    return (
      <div className='text-white p-4 border flex items-center justify-center border-white rounded shadow-md'>
        {label}
      </div>
    )
  }

  return (
    <div className='w-3/5 h-[40rem] flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
        Select a topic that you would like a video of
        </h1>

        <div className='min-w-[40%] flex flex-col gap-4 overflow-auto no-scrollbar h-2/5'>
          <Topic label="topic1"/>
          <Topic label="topic1"/>
          <Topic label="topic1"/>
          <Topic label="topic1"/>
        </div>

        <button onClick={openModal} disabled={false} className='border p-5 rounded-lg'>Advanced</button>

        <button onClick={callback} disabled={false} className='border p-5 rounded-lg'>Continue</button>
      </div>

    </div>
  )
};

export default TopicPick;