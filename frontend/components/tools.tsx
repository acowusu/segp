'use client'
import React from 'react';
import Image from 'next/image';

const Tools: React.FC = () => {

  const Tool = ({toolName, toolIcon}: {toolName: string, toolIcon: string}) => {
    return (
      <div className='border border-black text-white w-full min-h-16 hover:bg-gray-800 rounded-lg p-1'>
        <p>{toolName}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-auto no-scrollbar">
      <Tool toolName='Add Box' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
      <Tool toolName='Add Text' toolIcon='TODO'/>
    </div>
  );
};

export default Tools;