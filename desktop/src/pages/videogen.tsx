/**
 * @prettier
 */

import React, { useEffect, useRef, useState } from "react";
// import { MediaStore } from "../contexts/media/mediaStore";
import etro from "etro";
import { imageOptimizer } from "next/dist/server/image-optimizer";
import { Button } from "../components/ui/button";
import { log } from "console";
import api from "../../electron/routes";

type ChosenAsset = {
  src: string;
  duration: number;
  text?: string;
};

const dummyImages: ChosenAsset[] = [
  { src: "./example-min.jpg", duration: 2 },
  { src: "./example2-min.jpg", duration: 3 },
  { src: "./example3-min.jpg", duration: 0 },
];

const dummyAudio: ChosenAsset[] = [{ src: "./daniel1.mp3", duration: 5 }];

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
  const [videoBlob, setVideoBlob] = useState<Blob>();

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
        sourceWidth: 19200, // default: null (full width)
        sourceHeight: 10800, // default: null (full height)
        x: 0, // default: 0
        y: 0, // default: 0
        width: 1920, // default: null (full width)
        height: 1080, // default: null (full height)
        opacity: 0.8, // default: 1
      });

      start += img.duration;

      movie.addLayer(layer);
    });

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
  }, []);

  const downloadVideo = async () => {
    if (videoBlob) {
      window.api.webmBLobToMp4(await videoBlob.arrayBuffer(), "video.webm");
      // window.api.writeBlob("video.webm");
    }
  };

  const generateVideo = async () => {
    await movieRef.current
      ?.record({
        frameRate: 30,
        type: "video/webm;codecs=vp9",
        // audio: default true,
        // video: default true,
        // duration: default end of video
        // onStart: optional callback
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onStart: (_: MediaRecorder) => {
          console.log("recording started");
        },
      })
      .then((blob) => {
        const newBlob = new Blob([blob], { type: "video/webm" });
        setVideoBlob(newBlob);
        const url = URL.createObjectURL(newBlob);
        setVideoURL(url); // set the url so we can play
      });
    console.log("recording complete");
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
          <Button onClick={() => downloadVideo()}>download created webm</Button>
        </div>
      ) : (
        <div>
          <canvas className="w-full" ref={canvasRef}></canvas>
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
