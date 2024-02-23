/**
 * @prettier
 */
import React, { useEffect, useRef, useState } from "react";
import { Progress } from "../components/ui/progress";
import etro from "etro";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { SubtitleText } from "../lib/subtitle-layer";
import {
  CardContent,
  CardHeader,
  CardTitle,
  FramelessCard,
} from "../components/ui/card";
import { AudioInfo, ScriptData } from "../../electron/mockData/data";
const WIDTH = 1920;
const HEIGHT = 1080;

type ChosenAsset = {
  src: string;
  duration: number;
  text?: string;
};

const dummyImages: ChosenAsset[] = [
  { src: "./example-min.jpg", duration: 2 },
  { src: "./example2-min.jpg", duration: 2 },
  { src: "./example3-min.jpg", duration: 2 },
];

const dummyImages2 = [
  { src: "/home/kup/code/segp/project/Gas Fees0.jpg", duration: 2 },
  { src: "/home/kup/code/segp/project/Ethereum0.jpg", duration: 2 },
  { src: "/home/kup/code/segp/project/protocol0.jpg", duration: 2 },
];

const dummySubs: ChosenAsset[] = [
  { src: "hello", duration: 2 },
  { src: "these are ", duration: 2 },
  { src: "dummy subtitles", duration: 2 },
];
const dummyAudio: ChosenAsset[] = [{ src: "./daniel1.mp3", duration: 6 }];

// Dummy generator before the types are hashed out
export const VideoGeneratorDummy: React.FC = () => {
  return (
    <VideoGenerator
      chosenImages={dummyImages}
      chosenAudio={dummyAudio}
      chosenSubs={dummySubs}
    />
  );
};

export const VideoGeneratorBridge: React.FC = () => {
  const [chosenImages, setChosenImages] = useState<ChosenAsset[]>([]);
  const [chosenAudio, setChosenAudio] = useState<ChosenAsset[]>([]);
  const [chosenSubs, setChosenSubs] = useState<ChosenAsset[]>([]);

  useEffect(() => {
    window.api.getScript().then((scriptData: ScriptData[]) => {
      const imgTopics: string[] = scriptData.map((data: ScriptData) => {
        return data.sectionImageLookup?.[0] || "Topic not found";
      }); // if it exists get the first

      // Set Chosen Images
      console.log(`topics: ${imgTopics}`);
      window.api.fetchImages(imgTopics).then((topicImages: string[][]) => {
        const imgAssets: ChosenAsset[] = topicImages.map(
          (imgSrcs: string[]) => {
            // console.log(`images: ${imgSrcs[0]}`);
            return { src: imgSrcs[0], duration: 5 };
          }
        );
        for (const asset of imgAssets) {
          console.log(`imgASsets: ${asset.src}, ${asset.duration}`);
        }
        setChosenImages(imgAssets);
      });

      // subtitles are extracted per section and put in a list
      const subTexts: string[] = scriptData.map((data) => {
        return data.scriptTexts[data.selectedScriptIndex];
      });

      // Set Chosen Audio and Subs
      window.api.textToAudio(subTexts).then((infos: AudioInfo[]) => {
        const auds: ChosenAsset[] = [];
        const subs: ChosenAsset[] = [];
        for (const info of infos) {
          auds.push({ src: info.audioPath, duration: info.duration });
          subs.push({ src: info.subtitlePath, duration: info.duration });
        }
        setChosenAudio(auds);
        setChosenSubs(subs);
      });
      // });
    });
  }, []);

  return (
    <VideoGenerator
      chosenImages={chosenImages}
      chosenAudio={chosenAudio}
      chosenSubs={chosenSubs}
    />
  );
};

/** TODOs:
 * -> settigns needs to be added, from the previous tabs? most important is aspect ratio
 */
export const VideoGenerator: React.FC<{
  chosenImages: ChosenAsset[];
  chosenAudio: ChosenAsset[];
  chosenSubs: ChosenAsset[];
  /* settings: ? */
}> = ({ chosenImages, chosenAudio, chosenSubs }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const [videoURL, setVideoURL] = useState<string>();
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState<boolean>(false);
  const [isDownloadStarted, setIsDownloadStarted] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentProcess, setCurrentProcess] = useState<string>("");

  const [webmBlob, setWebmBlob] = useState<Blob>();

  useEffect(() => {
    if (!canvasRef.current) return; //null canvas ref
    const canvas = canvasRef.current;

    // Create the movie
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    canvas.width = 1920;
    canvas.height = 1080;

    let start = 0; // primitive: next image starts when one before ends

    // Add the Video layers
    chosenImages.map((img: ChosenAsset) => {
      const layer = new etro.layer.Image({
        startTime: start,
        duration: img.duration,
        source: img.src,
        sourceX: 0, // default: 0
        sourceY: 0, // default: 0
        sourceWidth: WIDTH, // default: null (full width)
        sourceHeight: HEIGHT, // default: null (full height)
        x: 0, // default: 0
        y: 0, // default: 0
        width: WIDTH, // default: null (full width)
        height: HEIGHT, // default: null (full height)
        opacity: 0.8, // default: 1
      });

      start += img.duration;

      movie.addLayer(layer);
    });

    start = 0;

    // Add the Subtitle Layers
    chosenSubs.map((sub: ChosenAsset) => {
      const subtitleLayer = new SubtitleText({
        startTime: start,
        duration: sub.duration, // TODO: change so that this reflects the duration of the actual section
        text: sub.src,
        x: 0, // default: 0
        y: 0, // default: 0
        // width: WIDTH/2, // default: null (full width)
        // height: 120, // default: null (full height)
        opacity: 1, // default: 1
        color: etro.parseColor("white"), // default: new etro.Color(0, 0, 0, 1)
        font: "100px sans-serif", // default: '10px sans-serif'
        textX: WIDTH / 2, // default: 0
        textY: HEIGHT, // default: 0
        textAlign: "center", // default: 'left'
        textBaseline: "alphabetic", // default: 'alphabetic'
        textDirection: "ltr", // default: 'ltr'
        background: new etro.Color(0, 0, 0, 0.51), // default: null (transparent)
      });

      start += sub.duration;
      movie.addLayer(subtitleLayer); // must exist here
      console.log("Finsihed subtitles");
    });

    // Add the Audio layers
    chosenAudio.map((aud: ChosenAsset) => {
      const layer = new etro.layer.Audio({
        startTime: start,
        duration: aud.duration,
        source: aud.src,
        sourceStartTime: 0, // default: 0
        muted: false, // default: false
        volume: 1, // default: 1
        playbackRate: 1, //default: 1
      });
      start += aud.duration;
      movie.addLayer(layer);
    });
    movieRef.current = movie;
  }, [chosenAudio, chosenImages]);

  const downloadAsMp4 = async () => {
    setCurrentProcess("Selecting the path to download Mp4...");
    setGenerationProgress(10);

    window.api.getDirectory().then(async (path: string) => {
      console.log(`download path = ${path}`);

      if (path === "" || path === undefined || path === null) {
        console.log("No download path selected"); // TODO: make this an alert popup
        return;
      }

      if (isVideoReady) {
        setIsDownloadStarted(true);
        console.log(`download path  = ${path}`);
        setCurrentProcess("Preparing the video");
        setGenerationProgress(20);
        const buff = await webmBlob!.arrayBuffer(); // exists becuaase of isVideoReady

        setCurrentProcess("Starting the mp4 Conversion");
        const interval = setInterval(() => {
          setGenerationProgress((prev) => {
            if (prev < 95) return prev + 0.2;
            clearInterval(interval);
            return prev;
          });
        }, 50);

        setCurrentProcess("Writing to mp4");
        window.api.webmDataToMp4File(buff, path).then(() => {
          clearInterval(interval);
          setGenerationProgress(100);
          setCurrentProcess("Downloaded");
        });
      } else {
        console.log("Video is not ready, cannot convert to mp4");
      }
    });
  };
  const generateVideo = async () => {
    setCurrentProcess("Starting");

    setGenerationProgress(10);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 95) return prev + 0.5;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    const blob = await movieRef.current?.record({
      frameRate: 30,
      type: "video/webm;codecs=vp9",
      // audio: default true,
      // video: default true,
      // duration: default end of video
      // onStart: optional callback
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onStart: (_: MediaRecorder) => {
        console.log("recording started");
        setCurrentProcess("Recording");
      },
    });
    clearInterval(interval);
    setGenerationProgress(95);
    const newBlob = new Blob([blob!], { type: "video/webm" });
    setWebmBlob(newBlob);
    const url = URL.createObjectURL(newBlob);
    setVideoURL(url); // set the url so we can play
    clearInterval(interval);
    setGenerationProgress(100);
    setCurrentProcess("Done generating the video");
    // start the mp4 conversion here
    setIsVideoReady(true); // change the display
  };

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <FramelessCard>
        <CardHeader>
          <CardTitle className="flex items-center justify-center ">
            Video Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {!isVideoReady ? (
              <>
                <Button
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => {
                    movieRef.current?.play();
                  }}
                >
                  Play
                </Button>
                <Button
                  className="flex items-center justify-center "
                  onClick={() => {
                    setIsGenerateClicked(true);
                    console.log("video creation started");
                    setTimeout(() => {
                      console.log("generating");
                      generateVideo();
                    }, 1000);
                  }}
                >
                  Create Video
                </Button>
              </>
            ) : !isDownloadStarted ? (
              <Button
                onClick={() => {
                  console.log("mp4 download clicked");
                  downloadAsMp4();
                }}
              >
                Download Video
              </Button>
            ) : (
              <div className="w-full flex align-center  items-center justify-center flex-col">
                <Progress value={generationProgress} className="w-5/6 mb-1" />
                <p className=" text-yellow-400">{currentProcess}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 flex-col mt-4">
            {isVideoReady ? (
              <div>
                <video
                  className="rounded-md w-full mb-4 flex align-center items-centerjustify-center flex-col gap-2"
                  width="640"
                  height="360"
                  controls
                >
                  <source src={videoURL} type="video/webm" />
                </video>
              </div>
            ) : isGenerateClicked ? (
              <>
                <Skeleton className="aspect-video w-full h-96  flex align-center items-center justify-center flex-col">
                  <Progress value={generationProgress} className="w-5/6 mb-1" />
                  <p className="text-yellow-400">{currentProcess}</p>
                </Skeleton>
              </>
            ) : (
              <canvas className="w-full rounded_md" ref={canvasRef}></canvas>
            )}
          </div>
        </CardContent>
      </FramelessCard>
    </div>
  );
};
