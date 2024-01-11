'use client'
import React from 'react';
import Image from 'next/image';

const MediaFiles: React.FC = () => {

  const MediaElement = () => {
    return (
      <div className='border border-black rounded-lg h-32 transform transition duration-700 ease-in-out hover:scale-105 cursor-pointer flex flex-col items-center justify-between p-2'>
        <p>Image</p>
        <p>name</p>
      </div>
    )
  }
  return (
    <div className="border border-black w-full h-full flex flex-col ">
      <h1 className='font-bold text-2xl p-2 border-black'>Media Files</h1>
      <div className='grid grid-cols-3 gap-4 overflow-auto no-scrollbar p-2 border-t-2 border-black'>
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
        <MediaElement />
      </div>
    </div>
  );
};

export default MediaFiles;