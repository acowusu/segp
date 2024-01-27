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
import { Button } from "../components/ui/button";
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

export const VideoEditor: React.FC = () => {
  const [additionalData, setAdditionalData] = useState<
    { id: string; additionalData: additionalDataType }[]
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
  const [selectedToReplace, setSelectedToReplace] =
    useState<TimelineAction | null>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    isPlaying ? movieRef.current?.pause() : movieRef.current?.play();
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
      movieRef.current.seek(time);
      isPlaying ? movieRef.current.play() : movieRef.current.refresh();
    }
  };

  const handleProgress = (
    time: number,
    _: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (movieRef.current) {
      movieRef.current.seek(time);
      isPlaying ? movieRef.current.play() : movieRef.current.refresh();
    }
    return true;
  };

  const handleAddNewAction = (media: { media: Video | string }) => {
    const row = data[0];
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
        duration: 2,
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
          { id: newAction.id, additionalData: { img: img } },
        ]);
        return newAction;
      },
    );

    setData([
      { id: "images", actions: timelineActions, rowHeight: 100 },
      {
        id: "audio",
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
      },
    ]);
    // setEffects(mediaStore.effects);
  }, []);

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center overflow-auto border p-4">
        <div className="grid h-2/5 grid-cols-2 border">
          <div className="no-scrollbar h-full overflow-auto border">
            <Media
              handleAddToPlayer={handleAddNewAction}
              toReplace={selectedToReplace}
            />
          </div>
          <div>
            <img className="hidden" src="/person.png" alt="" ref={imageRef} />
            <canvas className="w-full" ref={canvasRef} />
          </div>
        </div>
        <div className="flex w-[80%] flex-col">
          <div className="justify-row flex w-full flex-row items-center gap-4">
            <Switch checked={allowEdit} onCheckedChange={handleAllowEdit} />
            <Switch checked={showCursor} onCheckedChange={handleShowCursor} />
            <Switch
              checked={autoScrollWhenPlay}
              onCheckedChange={handleAutoScrollWhenPlay}
            />
            <TimelinePlayer
              handlePlayPause={handlePlayPause}
              timelineState={timelineState}
              autoScrollWhenPlay={autoScrollWhenPlay}
            />
          </div>
        </div>
        <div className="flex w-full">
          <div
            ref={domRef}
            style={{ overflow: "overlay" }}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              timelineState.current?.setScrollTop(target.scrollTop);
            }}
            className="w-1/4"
          >
            {data.map((item) => {
              return (
                <div key={item.id} className="flex w-full p-px">
                  <div className="w-full bg-teal-950">{`Media Component: ${item.id}`}</div>
                </div>
              );
            })}
          </div>
          <div className="w-full">
            <Timeline
              editorData={data}
              effects={effects}
              ref={timelineState}
              onChange={setData}
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
                  />
                );
              }}
              dragLine={true}
              onDoubleClickRow={() => {}}
              onScroll={({ scrollTop }) => {
                if (domRef.current) domRef.current.scrollTop = scrollTop;
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
