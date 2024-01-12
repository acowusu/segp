'use client'
import React from 'react';
import Image from 'next/image';
import fileSVG from '@/public/file.svg'

const Toolbar: React.FC = () => {

  function ToDoFuntion() {
    return
  }

  const ListItem = ({itemName, callback}: {itemName: string, callback: () => void}) => {
    return (
      <li className="py-2 px-4 hover:bg-blue-100 rounded-lg">
        <div onClick={callback}>{itemName}</div>
      </li>
    )
  }

  const MenuItem = ({menuName, filePath}: {menuName: string, filePath: string}) => {
    return (
      <div className="relative group">
        <button className="group flex items-center gap-1">
          <span>{menuName}</span>
          <Image src={filePath} alt="file" width={20} height={20} className='group-hover:text-gray-200 transform group-hover:rotate-180 transition duration-300 ease-in-out'/>

        </button>
        <ul className="absolute left-0 space-y-1 hidden group-hover:block bg-white text-gray-800 border border-gray-300 rounded-lg shadow-md w-40 z-10">
          <ListItem itemName = "New File" callback={ToDoFuntion}/>
          <ListItem itemName = "Save As" callback={ToDoFuntion}/>
          <ListItem itemName = "Open File" callback={ToDoFuntion}/>
        </ul>
      </div>
    )
  }



  return (
    <div className="bg-gray-700 p-1 flex flex-row gap-4 items-center z-10">
      <div className="text-white flex space-x-4">
        <MenuItem menuName='File' filePath={fileSVG}/>
        <MenuItem menuName='Edit' filePath={fileSVG}/>
        <MenuItem menuName='Settings' filePath={fileSVG}/>
        <MenuItem menuName='Export' filePath={fileSVG}/>
        <MenuItem menuName='Help' filePath={fileSVG}/>
        
          
        {/* Add more dropdown items here */}
      </div>
    </div>
  );
};

export default Toolbar;