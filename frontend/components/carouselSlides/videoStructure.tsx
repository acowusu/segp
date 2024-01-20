'use client'
import React, { TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { scriptsProp } from '../carousel';
import TextArea from '../textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../videoSlideAccordian';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DraggableIcon from "../../public/draggable.svg"

const ResponsiveGridLayout = WidthProvider(Responsive);

interface VideoStructureProps {
  callback: () => void;
  allScripts: scriptsProp;
}

const VideoStructure: React.FC<VideoStructureProps> = ({callback, allScripts}) => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);
  const [sectionOrder, setSectionOrder] = useState<number[]>([])

type layout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}[]

  const [layout, setLayout] = useState<layout>([]);

  useEffect(() => {
    if (sectionScriptChoice.length == 0) {
      setSectionScriptChoice(Array(allScripts.length).fill(0))
      setSectionOrder(Array.from(Array(10).keys()))
    }
    const initialLayout = allScripts.map((script, index) => ({
      i: index.toString(),
      x: 0,
      y: index,
      w: 1,
      h: 1,
    }));
    setLayout(initialLayout);
  }, [allScripts])

  const onLayoutChange = (newLayout: layout) => {
    setLayout(newLayout);
  };


  function updateScripts(content: string, innerIndex: number) {
    allScripts[sectionIndex].scripts[innerIndex] = content
  }
  
  const updateElement = (index: number, value: number) => {
    
    const newArray = [...sectionScriptChoice]; 
    newArray[index] = value; 
    setSectionScriptChoice(newArray); 
  };

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 };


  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ x: 0, y: 0 });

  const handleContextMenu = (event: { preventDefault: () => void; clientX: any; clientY: any; }) => {
    event.preventDefault(); // Prevent the default right-click menu
    setShowDropdown(true);
    setDropdownCoords({ x: event.clientX, y: event.clientY });
  };

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  const DropdownMenu = ({x, y, onClose}:{ x: number, y: number, onClose: () => void }) => {
    const style = {
      position: 'absolute',
      top: `${y}px`,
      left: `${x}px`,
      zIndex: 1000, 
    };
  
    return (
      <ul className="bg-white rounded-xl text-black">
        {/* List your menu items here */}
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        {/* ... other items */}
      </ul>
    );
  };




  return (
    <div className='flex flex-row h-full border rounded-xl shadow-lg shadow-white bg-black text-white'>

      <div className='p-8 basis-1/4 h-full flex flex-col gap-4 border-r shadow-2xl shadow-blue-600'>
        <h1 className='font-bold text-2xl 2xl:text-4xl'>
          Structure
        </h1>
        <div className='h-full overflow-auto no-scrollbar flex flex-col justify-start items-start gap-2 2xl:gap-4'>

          {layout.slice().sort((a, b) => a.y - b.y).map(({i, y}, index) => (
            <button onClick={() => {setSectionIndex(Number(i)); scrollToSection(Number(i));}}
            className={`text-lg 2xl:text-xl p-2 font-bold hover:underline ${Number(i) == sectionIndex && "text-blue-400"}`}
            style={{ textAlign: 'left', whiteSpace: 'normal' }}
            key={index}
            >
              {allScripts[Number(i)].section}
            </button>
          ))}
        </div>
        <button onClick={callback} disabled={sectionScriptChoice.some(item => item == -1)} 
        className='border p-2 2xl:p-5 rounded-lg disabled:bg-gray-700'
        >
          Create Video
        </button>
      </div>

      <div className='basis-3/4 h-full w-full flex flex-col items-center overflow-auto no-scrollbar'>
        {
          allScripts.length != 0 &&
          <ResponsiveGridLayout
            layouts={{ lg: layout }}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={300}
            onLayoutChange={onLayoutChange}
            draggableHandle=".drag-handle"
            className='flex flex-col items-center w-full m-4'
          >

          {allScripts.map(({scripts}, index) => (
            <div 
            onContextMenu={handleContextMenu} 
            key={index}
            onFocus={() => setSectionIndex(index)}
            onClick={() => {setSectionIndex(index); handleCloseDropdown()}}
            data-grid={layout.find(item => item.i === index.toString())}
            className={`max-w-2xl h-2/5 p-4 2xl:p-6 flex-shrink-0 border bg-zinc-800 rounded-lg overflow-auto no-scrollbar hover:bg-gray-800 ${index == sectionIndex && "shadow-lg shadow-blue-600 border-2 border-blue-400"}`}>
              {showDropdown && <DropdownMenu x={dropdownCoords.x} y={dropdownCoords.y} onClose={handleCloseDropdown} />}
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
              <div className='relative'>
                <blockquote contentEditable="true" onBlur={(event) => updateScripts(event.target.textContent ?? "", sectionScriptChoice[index])} suppressContentEditableWarning={true}>
                  {scripts[sectionScriptChoice[index]]}
                </blockquote>
                <div className='drag-handle hover:cursor-move absolute right-1 bottom'>
                  <Image src={DraggableIcon} alt='draggableIcon' width={30} height={30}/>
                </div>
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
        }
      </div>
    </div>
  )
};

export default VideoStructure;