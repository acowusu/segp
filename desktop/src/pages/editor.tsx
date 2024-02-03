import React, { useEffect, useState, useRef } from "react";
import { MediaStore } from "../contexts/media/mediaStore";
import { MediaStoreContext } from "../contexts/media";
import etro from "etro";
import {
  Timeline,
  TimelineEffect,
  TimelineRow,
  TimelineAction,
  TimelineState,
} from "@xzdarcy/react-timeline-editor";
import { TimeFrame } from "../components/timeline-components/timeFrame";
import TimelinePlayer from "../components/timeline-components/timelinePlayer";
import { Media } from "./mediaFiles";
import { Video } from "pexels";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../components/ui/context-menu";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Tooltip,
  Provider,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  TooltipArrow,
} from "@radix-ui/react-tooltip";

export const Editor: React.FC = () => {
  const [mediaStore] = useState(new MediaStore());
  return (
    <MediaStoreContext.Provider value={mediaStore}>
      <VideoEditor />
    </MediaStoreContext.Provider>
  );
};

export type additionalDataType = { img?: string; video?: Video };

export const VideoEditor: React.FC = () => {
  const [additionalData, setAdditionalData] = useState<
    { id: string; rowid: string; additionalData: additionalDataType }[]
  >([]);

  const mediaStore = React.useContext(MediaStoreContext);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const timelineState = useRef<TimelineState>(null);
  const domRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<TimelineRow[]>([]);
    const [effects, setEffects] = useState<Record<string, TimelineEffect>>({});
    const [allowEdit, setAllowEdit] = useState(true);
    const [showCursor, setShowCursor] = useState(true);
    const [autoScrollWhenPlay, setAutoScrollWhenPlay] = useState(true);
    const idRef = useRef(5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null)
    const [selectedToReplace, setSelectedToReplace] = useState<{rowid: string, action: TimelineAction} | null>(null)
    const [playbackRate, setPlaybackRate] = useState(1);
    const [selectedMedia, setSelectedMedia] = useState<string | Video>();


    const [isExportInProgress, setIsExportInProgress] = useState<boolean>(false);
    const [isExportedBefore, setIsExportedBefore] = useState<boolean>(false);

    const handlePlayPause = () => {
      const time = timelineState.current?.getTime() ?? 0;
      if (!isPlaying) {
        reRenderVideo();
      }
      movieRef.current?.seek(time);
      isPlaying ? movieRef.current?.pause() : movieRef.current?.play();
      setIsPlaying(!isPlaying);
    };

  const handleAllowEdit = () => {
    setAllowEdit(!allowEdit);
  };

  const handleShowCursor = () => {
    setShowCursor(!showCursor);
  };

  const handleAutoScrollWhenPlay = () => {
    setAutoScrollWhenPlay(!autoScrollWhenPlay);
  };

  const handleCursorSeek = (time: number) => {
    if (movieRef.current) {
      movieRef.current.pause();
      setIsPlaying(false);
      movieRef.current.seek(time);
      movieRef.current.refresh();
    }
  };

  const handleProgress = (
    time: number,
    _: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (movieRef.current) {
      reRenderVideo();
      console.log(time);
      movieRef.current.pause();
      setIsPlaying(false);
      movieRef.current.seek(time);
      movieRef.current.refresh();
    }
    return true;
  };

  const reRenderVideo = () => {
    if (!canvasRef.current) return; // If the canvas ref is null,
    if (!imageRef.current) return; // If the image ref is null,
    const canvas = canvasRef.current;

    // Create a new movie instance
    mediaStore.setMovie(
      new etro.Movie({
        canvas: canvas,
        repeat: false,
        background: etro.parseColor("#FF0000"),
      }),
    );

      data.forEach((row) => {
        if (row.id !== "Audio") {
          const layers = row.actions.map((action) => {
            const img = (additionalData.find(({ id }) => action.id === id)?.additionalData || {img: ""}).img ?? ""
            const layer = new etro.layer.Image({
              startTime: action.start / playbackRate,
              duration: (action.end - action.start) / playbackRate,
              source: img,
              sourceX: 0, // default: 0
              sourceY: 0, // default: 0
              sourceWidth: 1920, // default: null (full width)
              sourceHeight: 1080, // default: null (full height)
              x: 0, // default: 0
              y: 0, // default: 0
              width: 1920, // default: null (full width)
              height: 1080, // default: null (full height)
              opacity: 1 , // default: 1
            })
            mediaStore.set(action.id, layer)
            return layer
          })
          mediaStore.addLayers(layers);
        }
      })
      
      mediaStore.refresh();
      movieRef.current = mediaStore.getMovie();
      console.log(mediaStore._actionLayerMap)

    }

    const deleteLayer = (rowid:string ) => {
      setData((prev) => prev.filter((item) => item.id !== rowid))
      reRenderVideo();
    }

    const deleteItem = (id: string, rowid:string ) => {
      setData((prev) => prev.map((rowdata) => {
        if (rowdata.id === rowid) {
          return {
            ...rowdata,
            actions: rowdata.actions.filter((item) => item.id !== id),
          };
        }
        return rowdata;
      }),
    );
  };

    const createNewLayer = () => {
      const newData = data
      newData.splice(data.length - 1, 0, {
        id: `Layer ${idRef.current++}`,
        actions: [],
        rowHeight: 150
      })
      setData(newData)
      reRenderVideo();
    }

    // replace next selected item or add new item to timeline
    const handleAddNewAction = (_: React.MouseEvent<HTMLElement, MouseEvent>, param: {row: TimelineRow; time: number; }) => {
      if (!selectedMedia) return;
        // instead of adding directly to second row, we should add to selected row
        // instead of adding at current timestamp add at clicked timestamp
      setData((prev) => { 
          const rowIndex = prev.findIndex(item => item.id === param.row.id);
          const newAction: TimelineAction = {
              id: `action${idRef.current++}`,
              start: param.time,
              end: param.time + 0.5,
              effectId: "effect0",
          }
          setAdditionalData((prev) => [...prev, {id: newAction.id, rowid: param.row.id, additionalData: {img: (typeof selectedMedia === "string" ? selectedMedia : undefined), video: (typeof selectedMedia !== "string" ? selectedMedia : undefined)}}])
          prev[rowIndex] = {...param.row, actions: param.row.actions.concat(newAction)};
          return [...prev];
        })
      reRenderVideo();
    };

    const handleReplaceAction = (media: Video | string ) => {
      if (selectedToReplace) {
        const {action} = selectedToReplace;
        const newData = additionalData
        const dataIndex = newData.findIndex(({id}) => id === action.id)
        newData[dataIndex].additionalData =  {img: (typeof media === "string" ? media : undefined), video: (typeof media !== "string" ? media : undefined)}
        setAdditionalData(newData)
        setSelectedToReplace(null)
        reRenderVideo();
      }
    }

    const saveMovieAsMp4 = async () => {

      await mediaStore.getMovie()?.record({
          frameRate: mediaStore.framerate,
          type: "video/webm;codecs=vp9",
          // audio: default true,
          // video: default true,
          // duration: default end of video
          // onStart: optional callback
          onStart: (_: MediaRecorder) => {
              console.log("recording started");
              setIsExportedBefore(true)
              setIsExportInProgress(true);
          },
      })
      .then((blob) => {
        const newBlob = new Blob([blob], {type: "video/mp4"})
        const url = URL.createObjectURL(newBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "video.mp4";
        // a.onabort = () => {
        //   setIsExportInProgress(false);
        // }
        a.click();
        setIsExportInProgress(false);
        
      });
  };

  useEffect(() => {
    // Use the canvas ref to get the canvas element
    if (!canvasRef.current) return; // If the canvas ref is null,
    if (!imageRef.current) return; // If the image ref is null,
    const canvas = canvasRef.current;

    // Create a new movie instance
    mediaStore.setMovie(
      new etro.Movie({
        canvas: canvas,
        repeat: false,
        background: etro.parseColor("#ccc"),
      }),
    );

    // Add a video layer to the movie and play it

    canvas.width = 1920;
    canvas.height = 1080;

    const mocklayers = [
      new etro.layer.Visual({
        startTime: 0,
        duration: 2,
        background: etro.parseColor("#f1c40f"),
      }),
      new etro.layer.Visual({
        startTime: 2,
        duration: 2,
        background: etro.parseColor("#f39c12"),
      }),
      new etro.layer.Image({
        startTime: 0,
        duration: 4,
        source: imageRef.current,
        sourceX: 0, // default: 0
        sourceY: 0, // default: 0
        sourceWidth: 19200, // default: null (full width)
        sourceHeight: 10800, // default: null (full height)
        x: 0, // default: 0
        y: 0, // default: 0
        width: 1920, // default: null (full width)
        height: 1080, // default: null (full height)
        opacity: 0.8, // default: 1
      }),
      new etro.layer.Image({
        startTime: 2,
        duration: 2,
        source: imageRef.current,
        sourceX: 0, // default: 0
        sourceY: 0, // default: 0
        sourceWidth: 19200, // default: null (full width)
        sourceHeight: 10800, // default: null (full height)
        x: 1000, // default: 0
        y: 600, // default: 0
        width: 1920, // default: null (full width)
        height: 1080, // default: null (full height)
        opacity: 0.8, // default: 1
      }),
    ];

    mediaStore.addLayers(mocklayers);
    mediaStore.refresh();
    movieRef.current = mediaStore.movie;

    // row.actions
    // row.classNames
    // row.id
    // row.rowHeight
    // row.selected

    // data should only have 2 rows for now, the first row being the images, the second row being the audio

    const dummyData = [
      { img: "./example.jpg", start: 0.0, duration: 2.1 },
      { img: "./example2.jpg", start: 2.1, duration: 1.6 },
      { img: "./example3.jpg", start: 4, duration: 0.4 },
    ];

    const timelineActions: TimelineAction[] = dummyData.map(
      ({ img, start, duration }) => {
        const newAction: TimelineAction = {
          id: `action${idRef.current++}`,
          start: start,
          end: start + duration,
          effectId: "effect0",
        };
        setAdditionalData((prev) => [
          ...prev,
          { id: newAction.id, rowid: "Layer1", additionalData: { img: img } },
        ]);
        return newAction;
      },
    );

    setData([
      { id: "Default", actions: timelineActions, rowHeight: 150 },
      {
        id: "Audio",
        actions: [
          {
            id: `action${idRef.current++}`,
            start: 0,
            end:
              dummyData[dummyData.length - 1].start +
              dummyData[dummyData.length - 1].duration,
            effectId: "effect0",
          },
        ],
        rowHeight: 60,
      },
    ]);
    // setEffects(mediaStore.effects);

    // reRenderVideo()
  }, []);

    return ( 
      <>
      <div className="w-full h-screen p-4 flex flex-col items-center border overflow-auto">
        <div className="grid grid-cols-2 h-2/5 border">
          <div className="border overflow-auto h-full no-scrollbar">
            <Media
              handleSelectMedia={setSelectedMedia}
              handleReplaceMedia={handleReplaceAction} 
            />
          </div>
          <div>
            <img className="hidden" src="/person.png" alt="" ref={imageRef} />
            <canvas className="w-full" ref={canvasRef} />
          </div>
        </div>
          <div className='flex flex-row w-full border items-center justify-center gap-4'>
              <TimelinePlayer
                  handlePlayPause={handlePlayPause} 
                  timelineState={timelineState} 
                  autoScrollWhenPlay={autoScrollWhenPlay}
                  handleSetRate={setPlaybackRate}
              />
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded-lg m-4"
                onClick={() => {
                  mediaStore.seek(0);
                  console.log("export button clicked");
                  setTimeout(() => {
                    console.log("exporting function called");
                    saveMovieAsMp4();
                  }, 1000);
                }}
              >
                Export Video as MP4
              </button>
              { isExportedBefore 
                ? (isExportInProgress
                  ? (<div className="text-yellow-400"> Exporting... </div>)
                  : (<div className="text-green-400"> Export Complete </div>))
                : ""
              }
          </div>
        <div className="flex w-full bg-[#191b1d] h-[75%]">
            <div
                ref={domRef}
                style={{ overflow: 'overlay' }}
                onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    timelineState.current?.setScrollTop(target.scrollTop);
                }}
                className="w-[10%]"
            >
              <Button className={`flex w-full mt-[3px] border-opacity-40 p-2 items-center justify-center hover:cursor-pointer`}
              onClick={createNewLayer}
            >
              Add +
            </div>
            {data.map((item) => {
              return (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div
                      key={item.id}
                      className={`flex w-full ${item.id !== "Audio" ? "h-[150px]" : "h-[60px]"} items-center justify-center border border-gray-500 border-opacity-40 p-2`}
                    >
                      {`${item.id} Layer`}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => deleteLayer(item.id)}>
                      Delete Layer
                    </ContextMenuItem>
                    <ContextMenuItem>Rename Layer</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                );
              })}
            </div>
            <div className="w-full"> 
                <Timeline 
                    editorData={data}
                    effects={effects}
                    ref={timelineState}
                    onChange={setData}
                    autoReRender={true}
                    autoScroll={true}
                    minScaleCount={movieRef.current?.duration}
                    onCursorDrag={handleCursorSeek}
                    onClickTimeArea={handleProgress}
                    disableDrag={!allowEdit}
                    hideCursor={!showCursor}
                    getActionRender={(action, row) => {
                        setSelectedItem(action.id)    
                        return <TimeFrame 
                          action={action} 
                          row={row} 
                          data={
                            additionalData.find(({ id }) => action.id === id)?.additionalData || {img: ""}
                          } 
                          deleteItem={deleteItem}
                          setToReplace={setSelectedToReplace}
                          toReplace={selectedToReplace}
                          />
                    
                    }}
                    dragLine={true}
                    onDoubleClickRow={handleAddNewAction}
                    onScroll={({ scrollTop }) => {
                        if (domRef.current)
                            domRef.current.scrollTop = scrollTop;
                    }}
                />
            </div>
        </div>
      </div>
    </>
  );
};
