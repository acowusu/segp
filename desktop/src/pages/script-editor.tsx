import React, { useEffect, useState } from 'react';
// import { Button } from "../components/ui/button";
// import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
// import { Badge } from "../components/ui/badge";
// import {
//   FramelessCard,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/card";
// import { ScrollArea } from "../components/ui/scroll-area";
// import { Topic } from "../../electron/mockData/data";
// export const ScriptEditor: React.FC = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState<Topic[]>([]);
//   const [selectedTopic, setSelectedTopic] = useState<Topic>({} as Topic);
//   const [disabled, setDisabled] = useState(false);
//   useEffect( () => {
//     window.api.getTopics().then((data) => {
//       setItems(data);
//     });
//   }, []);
 
  
//   const setTopic = async (topic :Topic) => {
//     if (disabled) return;
//     setDisabled(true);
//     if (topic !== undefined) {
//       setSelectedTopic(topic);
//       await window.api.setTopic(topic);
//     }
//     setDisabled(false);
//   };
//   const setAudience = async () => {
//     navigate("/welcome/set-audience");
//   };
//   return (
//     <div className="flex items-center justify-center mt-4">
//       <FramelessCard >
//         <CardHeader>
//           <CardTitle>Script Editor</CardTitle>
          
//         </CardHeader>
//         <CardContent className="h-4/6">
//           <ScrollArea className="h-4/6">
//             <div className="flex flex-col gap-2 p-4 pt-0">
//               {items.map((item) => (
//                 <button
//                   key={item.topic}
//                   className={cn(
//                     "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all border-2",
//                     selectedTopic.topic === item.topic && " border-2 border-sky-500",
//                     selectedTopic.topic !== item.topic && "hover:border-sky-500 hover: hover:border-dashed"
//                   )}
//                   onClick={()=>setTopic(item)}
//                 >
//                     <div
//                   className={cn(
//                     "ml-auto text-xs",
//                     selectedTopic.topic === item.topic
//                       ? "text-foreground"
//                       : "text-muted-foreground"
//                   )}
//                 >
//                     {/* View Other Drafts */}
//                     <Badge  variant={"secondary"}>
//                     View Other Drafts
//                   </Badge>
//                 </div>
//                   {selectedTopic.topic === item.topic && (
//                    <div className="grid md:grid-cols-3 gap-4 w-full">
//                    <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"cloud"}>Draft 1</Badge></div> { item.summary}</div>
//                    <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"secondary"}>Draft 2</Badge></div> sunt in culpa qui officia deserunt mollit anim id est laborum</div>
//                    <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"secondary"}>Draft 3</Badge></div>  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</div>
//                  </div>)}
//                   <div className="flex w-full flex-col gap-1">
//                     <div className="flex items-center">
//                       <div className="flex items-center gap-2">
//                         <div className="font-semibold">{item.topic}</div>
//                       </div>
//                     </div>
//                     {/* <div className="text-xs font-medium">{item.subject}</div> */}
//                   </div>
//                   <div className="line-clamp-2 text-xs text-muted-foreground">
//                     {item.summary}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </ScrollArea>
//         </CardContent>
//         <CardFooter className="flex justify-between">
//           <Button variant="outline">Back</Button>
//           <Button onClick={setAudience}>Next</Button>
//         </CardFooter>
//       </FramelessCard>
//     </div>
//   );
// };

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/videoSlideAccordian';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DraggableIcon from "../../public/draggable.svg"
import BinIcon from "../../public/bin.svg"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card"

export type TopicScripts = {section: string, scripts: string[]}[]

const ResponsiveGridLayout = WidthProvider(Responsive);


export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [sectionIndex, setSectionIndex] = useState(0);
  const[sectionScriptChoice, setSectionScriptChoice] = useState<number[]>([]);
  const [sectionOrder, setSectionOrder] = useState<number[]>([])
  const [allScripts, setAllScripts] = useState<TopicScripts>([])


  useEffect( () => {
    window.api.getScripts().then((data) => {
      setAllScripts(data);
    });
  }, []);

  async function generateNewScript() {
    window.api.generateMoreScripts(allScripts[sectionIndex]).then((newScript) => {
      setAllScripts(prev => prev.map((item, i) => (i === sectionIndex ? { ...item, scripts: [...item.scripts, newScript] } : item)));
    });
  }

  const generateVideo = async () => {
    // send data and start the pipeline, then move to the video editor
    // setloading while doing so, then enter the loading state while the pipeline runs. once finished, send to the editor


    navigate("/welcome/video-editor");
  };

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
    const initialLayout = allScripts.map((_, index) => ({
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


  function deleteItem(index: number) {
    allScripts.splice(index, 1); 
    console.log(allScripts)
  }
 


  return (
    <div className='flex flex-row h-screen rounded-xl shadow-lg shadow-white text-white'>

      <div className='p-8 basis-1/4 h-full flex flex-col gap-4 border-r shadow-2xl shadow-blue-600'>
        <h1 className='font-bold text-2xl 2xl:text-4xl'>
          Script Editor
        </h1>
        <div className='h-full overflow-auto no-scrollbar flex flex-col justify-start items-start gap-2 2xl:gap-4'>

          {layout.slice().sort((a, b) => a.y - b.y).map(({i}, index) => (
            <button onClick={() => {setSectionIndex(Number(i));}}
            className={`text-lg 2xl:text-xl p-2 font-bold hover:underline ${Number(i) == sectionIndex && "text-blue-400"}`}
            style={{ textAlign: 'left', whiteSpace: 'normal' }}
            key={index}
            >
              {allScripts[Number(i)].section}
            </button>
          ))}
        </div>
        <button disabled={sectionScriptChoice.some(item => item == -1)} 
        className='border p-2 2xl:p-5 rounded-lg disabled:bg-gray-700' onClick={generateVideo}
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
            className='flex p-8 flex-col items-center w-full m-4'
          >

          {allScripts.map(({scripts}, index) => (
            <div
              key={index}
              onFocus={() => setSectionIndex(index)}
              onClick={() => {setSectionIndex(index)}}
              data-grid={layout.find(item => item.i === index.toString())}
              className={`h-2/5 p-4 2xl:p-6 flex-shrink-0 border bg-zinc-800 rounded-lg overflow-auto no-scrollbar hover:bg-gray-800 ${index == sectionIndex && "shadow-lg shadow-blue-600 border-2 border-blue-400"}`}>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger >
                    <div className="w-full flex items-center justify-end text-neutral-400 text-xs 2xl:text-sm font-normal font-['Inter'] mb-4 hover:cursor-pointer">
                      View other Drafts
                    </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='flex flex-row justify-between'>

                        <div className='basis-10/12 flex flex-row gap-4 2xl:gap-8 overflow-auto'>
                          {
                            allScripts[index].scripts.map((content, innerIndex) => (
                              <div 
                              key={innerIndex} 
                              onClick={() => {updateElement(index, innerIndex); updateScripts(scripts[innerIndex], innerIndex)}}
                              className={`hover:cursor-pointer border-2 h-[6rem] min-w-[20rem] max-w-[20rem] rounded-lg p-4 ${innerIndex == sectionScriptChoice[index] && "border-blue-400"} overflow-auto no-scrollbar`}>
                                {content}
                              </div>
                            ))
                          }
                        </div>
                        
                        <div className='basis-1/12 h-inherit flex items-center justify-center hover:cursor-pointer border-2 rounded-lg z-10 bg-zinc-800' onClick={generateNewScript}>
                        <HoverCard>
                          <HoverCardTrigger><h1 className='text-4xl'>+</h1></HoverCardTrigger>
                          <HoverCardContent>
                            Get LLM to generate a new script promp for you
                          </HoverCardContent>
                        </HoverCard>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className='flex flex-col justify-between h-[85%]'>
                  <blockquote contentEditable="true" onBlur={(event) => updateScripts(event.target.textContent ?? "", sectionScriptChoice[index])} suppressContentEditableWarning={true}>
                    {scripts[sectionScriptChoice[index]]}
                  </blockquote>
                  <div className='w-full flex justify-between'>
                    <div className='hover:cursor-pointer' onClick={() => deleteItem(index)}>
                      <img src={BinIcon} alt='bin' width={30} height={30}/>
                    </div>
                    <div className='drag-handle hover:cursor-move'>
                      <img src={DraggableIcon} alt='draggableIcon' width={30} height={30}/>
                    </div>
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

