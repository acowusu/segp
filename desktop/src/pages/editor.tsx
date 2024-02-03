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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedToReplace, setSelectedToReplace] = useState<{
    rowid: string;
    action: TimelineAction;
  } | null>(null);


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
          const img =
            (
              additionalData.find(({ id }) => action.id === id)
                ?.additionalData || { img: "" }
            ).img ?? "";
          return new etro.layer.Image({
            startTime: action.start,
            duration: action.end - action.start,
            source: img,
            sourceX: 0, // default: 0
            sourceY: 0, // default: 0
            sourceWidth: 1920, // default: null (full width)
            sourceHeight: 1080, // default: null (full height)
            x: 0, // default: 0
            y: 0, // default: 0
            width: 1920, // default: null (full width)
            height: 1080, // default: null (full height)
            opacity: 1, // default: 1
          });
        });
        mediaStore.addLayers(layers);
      }
    });

    mediaStore.refresh();
    movieRef.current = mediaStore.getMovie();
  };

  const deleteLayer = (rowid: string) => {
    setData((prev) => prev.filter((item) => item.id !== rowid));
  };

  const deleteItem = (id: string, rowid: string) => {
    setData((prev) =>
      prev.map((rowdata) => {
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
    const newData = data;
    newData.splice(data.length - 1, 0, {
      id: `Layer ${idRef.current++}`,
      actions: [],
      rowHeight: 150,
    });
    setData(newData);
  };

  const handleAddNewAction = (media: { media: Video | string }) => {
    if (selectedToReplace) {
      const { action } = selectedToReplace;
      const newData = additionalData;
      const dataIndex = newData.findIndex(({ id }) => id === action.id);
      newData[dataIndex].additionalData = {
        img: typeof media === "string" ? media : undefined,
        video: typeof media !== "string" ? media : undefined,
      };
      setAdditionalData(newData);
      setSelectedToReplace(null);
    } else {
      const row = data[1];
      const time = timelineState.current?.getTime() ?? 0;
      setData((prev) => {
        const rowIndex = prev.findIndex((item) => item.id === row.id);
        const newAction: TimelineAction = {
          id: `action${idRef.current++}`,
          start: time,
          end: time + 0.5,
          effectId: "effect0",
        };
        setAdditionalData((prev) => [
          ...prev,
          {
            id: newAction.id,
            rowid: row.id,
            additionalData: {
              img: typeof media === "string" ? media : undefined,
              video: typeof media !== "string" ? media : undefined,
            },
          },
        ]);
        prev[rowIndex] = { ...row, actions: row.actions.concat(newAction) };
        return [...prev];
      });
    }
  };

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

  // Ratios from the figma
  // return (
  //   <>
  //     <div className="bg-red-700">
  //       <div className="grid-rows-[5fr_60fr_41fr] grid-cols-[31fr_49fr] grid h-screen w-screen pl-5">
  //         <div className="bg-red-300 col-span-2">Editor Buttons</div>
  //         <div className="bg-green-200 row-span-1">Utilities</div>
  //         <div className="bg-yellow-200 row-span-1">
  //           Player
  //           <img className="hidden" src="/person.png" alt="" ref={imageRef} />
  //           <canvas className="w-full" ref={canvasRef} />
  //         </div>
  //         <div className=" col-span-2 grid grid-cols-[5fr_89fr] grid-rows-[5fr_35fr]">
  //           <div className="bg-yellow-700 col-span-2"> Timeline Buttons</div>
  //           <div className="bg-blue-700 col-span-1"> Layer Titles </div>
  //           <div className="bg-green-700 col-span-1"> Assets </div>
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // );

  /* TODO Notes for self:
   *  -> the while player grid is the canvas (resize the util bar according to aspect ratio)
   *  -> Remove the 'flex' annotations where it isn't needed => check children nodes if they depend on it!
   *  -> Add the export state tracker on the top right on the editorbuttons section
   *
   */
  // FIX: hardcoded at the moment, will figure out how to make this dynamic
  const timelineStyle: React.CSSProperties = { width: "100%" };
  return (
    <>
      {/* <div className="w-full h-screen p-4 flex flex-col items-center border overflow-auto"> */}
      <div className="w-dvh grid h-dvh grid-cols-[31fr_49fr] grid-rows-[5fr_60fr_41fr]">
        {" "}
        {/* TODO fix the weird clipping*/}
        {/* <div className="grid grid-cols-2 h-2/5 border"> */}{" "}
        {/* I wanna get rid of this and just use columns*/}
        {/* Media Tab */}
        {/* <div className="border overflow-auto h-full no-scrollbar"> */}
        <div className="col-span-2 bg-red-300 ">Editor Buttons</div>
        <div className="row-span-1 flex overflow-auto border">
          <Media handleAddToPlayer={handleAddNewAction} />
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
                      className={`flex w-full ${
                        item.id !== "Audio" ? "h-[150px]" : "h-[60px]"
                      } items-center justify-center border border-gray-500 border-opacity-40 p-2`}
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
                setSelectedItem(action.id);
                return (
                  <TimeFrame
                    action={action}
                    row={row}
                    data={
                      additionalData.find(({ id }) => action.id === id)
                        ?.additionalData || { img: "" }
                    }
                    deleteItem={deleteItem}
                    setToReplace={setSelectedToReplace}
                    toReplace={selectedToReplace}
                  />
                );
              }}
              dragLine={true}
              onDoubleClickRow={() => {}}
              onScroll={({ scrollTop }) => {
                if (domRef.current) domRef.current.scrollTop = scrollTop;
              }}
            />
            <button
              className="m-4 rounded-lg bg-gray-500 px-1 py-1 font-bold text-white hover:bg-gray-700"
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
          </div>
        </div>
      </div>
    </>
  );
};
