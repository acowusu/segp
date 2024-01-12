'use client'
import React from 'react';
import Image from 'next/image';
import TopicPick from './topic_pick';

const UploadFile: React.FC<{callback: () => void }> = ({callback}) => {

  
  return (
    <div className='w-3/5 h-[40rem] flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-red-600 text-white'>

      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
          Upload PDF to turn into a video
        </h1>
            
        <button className='border p-5'>
          Upload
        </button>

        <div className='border w-4/5 overflow-auto no-scrollbar h-2/5'>
          <p>
            Uploaded files:
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
        </div>

        <button onClick={callback} disabled={false} className='border p-5'>Continue</button>
      </div>
    </div>
  );
};

export default UploadFile;