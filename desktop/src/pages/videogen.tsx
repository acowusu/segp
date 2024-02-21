import React, { useEffect, useRef, useState } from "react";
// import { MediaStore } from "../contexts/media/mediaStore";
import { Progress } from "../components/ui/progress";
import etro from "etro";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { SubtitleText } from "../lib/subtitle-layer";
import { synchronized } from "../lib/utils";
const WIDTH = 1920;
const HEIGHT = 1080;

type ChosenAsset = {
  src: string;
  duration: number;
  text?: string;
};

const dummyImages: ChosenAsset[] = [
  { src: "./example-min.jpg", duration: 5 },
  { src: "./example2-min.jpg", duration: 5 },
  { src: "./example3-min.jpg", duration: 7 },
];

const dummyAudio: ChosenAsset[] = [{ src: "./daniel1.mp3", duration: 17 }];

// Dummy generator before the types are hashed out
export const VideoGeneratorDummy: React.FC = () => {
  return <VideoGenerator chosenImages={dummyImages} chosenAudio={dummyAudio} />;
};

/** TODOs:
 * -> settigns needs to be added, from the previous tabs? most important is aspect ratio
 * -> support other layers, audio
 * -> overlaiying of visual layers for subtitles on top of the visuals
 */
export const VideoGenerator: React.FC<{
  chosenImages: ChosenAsset[];
  chosenAudio: ChosenAsset[] /* settings: ? */;
}> = ({ chosenImages, chosenAudio }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const [videoURL, setVideoURL] = useState<string>();
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentProcess, setCurrentProcess] = useState<string>("");

  // this is now used to store the mp4 blob
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
    const subtitleLayer = new SubtitleText({
      startTime: 0,
      duration: 20,
      text: (_element: etro.EtroObject, time: number) => {
        return Math.round(time) % 2 === 0
          ? "Lorem ipsum dolor sit amet, ct dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum"
          : "World";
      },
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
    movie.addLayer(subtitleLayer);
    start = 0;

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
        console.log(`download path  = ${path}`);
        setCurrentProcess("Preparing the video");
        setGenerationProgress(20);
        const buff = await webmBlob!.arrayBuffer(); // exists becuaase of isVideoReady

        setCurrentProcess("Starting the Mp4 Conversion");
        const interval = setInterval(() => {
          setGenerationProgress((prev) => {
            if (prev < 80) return prev + 0.2;
            clearInterval(interval);
            return prev;
          });
        }, 50);
        setCurrentProcess("Writing the mp4");
        window.api.webmDataToMp4File(buff, path).then(() => {
          setCurrentProcess("Done!");
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
        if (prev < 80) return prev + 0.5;
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
    <div>
      <h1> Video Generation </h1>
      {isVideoReady ? (
        <div>
          <video width="640" height="360" controls>
            <source src={videoURL} type="video/webm" />
          </video>
          <Button
            disabled={false}
            onClick={() => {
              console.log("mp4 download clicked");
              downloadAsMp4();
            }}
          >
            Download Mp4
          </Button>
        </div>
      ) : (
        <div>
          {isGenerateClicked ? (
            <>
              <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
                <Progress value={generationProgress} className="w-5/6 mt-4" />
                <p className="text-yellow-400">{currentProcess}</p>
              </Skeleton>
            </>
          ) : (
            <canvas className="w-full mb-4 " ref={canvasRef}></canvas>
          )}

          <Button
            onClick={() => {
              setIsGenerateClicked(true);
              console.log("video creation started");
              setTimeout(() => {
                console.log("generating");
                generateVideo();
              }, 1000);
            }}
          >
            create video
          </Button>
          <Button
            className="ml-4"
            onClick={() => {
              movieRef.current?.play(); //cannot record while playing.
            }}
          >
            Play
          </Button>
          {isGenerateClicked ? (
            <p className="text-yellow-400"> Generating...</p>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};
