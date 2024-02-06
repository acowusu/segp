/**
 *  @prettier
 */

import React, { useEffect, useRef, useState } from "react";
// import { MediaStore } from "../contexts/media/mediaStore";
import etro from "etro";
import { imageOptimizer } from "next/dist/server/image-optimizer";
import { Button } from "../components/ui/button";
import { log } from "console";

type ChosenImage = {
  imgSrc: string;
  duration: number;
  text?: string;
};

const dummy: ChosenImage[] = [
  { imgSrc: "./example-min.jpg", duration: 2 },
  { imgSrc: "./example2-min.jpg", duration: 2 },
  { imgSrc: "./example3-min.jpg", duration: 2 },
];

export const VideoGeneratorDummy: React.FC = () => {
  return <VideoGenerator chosenImages={dummy} />;
};
// might need a media store
export const VideoGenerator: React.FC<{ chosenImages: ChosenImage[] }> = ({
  chosenImages,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const [videoURL, setVideoURL] = useState<string>();
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return; //null canvas ref
    const canvas = canvasRef.current;

    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    canvas.width = 1920;
    canvas.height = 1080;

    // TODO: add other types of layer, audio etc, take as param to component
    let start = 0;

    console.log(chosenImages);

    chosenImages?.map((img: ChosenImage) => {
      const layer = new etro.layer.Image({
        startTime: start,
        duration: img.duration,
        source: img.imgSrc,
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
      movieRef.current = movie;
    });

    // for (const layer of imgLayers) {
    //   movie.addLayer(layer);
    // }
  }, []);

  const downloadPath: string = "./video.webm";

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
        const newBlob = new Blob([blob], { type: "video/mp4" });
        const url = URL.createObjectURL(newBlob);
        setVideoURL(url);
      });
    console.log("saved as mp4");
    setIsVideoReady(true);
  };

  return (
    <div>
      <h1> Video Generation </h1>
      {isVideoReady ? (
        <video width="640" height="360" controls>
          <source src={videoURL} type="video/webm" />
        </video>
      ) : (
        <div>
          <canvas className="w-full" ref={canvasRef}></canvas>
          <Button
            onClick={() => {
              setIsGenerateClicked(true);
              console.log("video creation started");
              setTimeout(() => {
                console.log("expo");
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
