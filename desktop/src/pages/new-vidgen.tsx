/**
 * @prettier
 */
import React, { useRef, useState } from "react";
import { Progress } from "../components/ui/progress";
import etro from "etro";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { MagicWandIcon, PlayIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import {
  CardDescription,
  CardHeader,
  CardTitle,
  FramelessCard,
} from "../components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { SectionData } from "../../electron/mockData/data";
import { fixLerpForMediaLayer, getMediaLayer } from "../lib/etro-utils";

export const NewVideoGenerator: React.FC = () => {
  const navigate = useNavigate();
  type CurrentState =
    | "initial"
    | "playback"
    | "playing"
    | "rendering"
    | "loading";
  const [currentState, setCurrentState] = useState<CurrentState>("initial");
  const [currentProcess, setCurrentProcess] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const movieRef = useRef<etro.Movie | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get the sections
  const { state } = useLocation();
  const sections: SectionData[] = state.sections;
  console.log("movies got from state:", sections);

  const createMovie = async () => {
    if (canvasRef.current == undefined) {
      console.log("No canvas exists, canvasRef is null");
      return;
    }
    if (movieRef.current != undefined) {
      console.log("Movie exists: movieRef is not null");
      return;
    }
    const canvas = canvasRef.current;
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });
    canvas.width = 1920;
    canvas.height = 1080;
    movieRef.current = movie;
  };

  const generateMovie = async () => {
    setCurrentState("loading");
    setCurrentProcess("Creating the Movie");
    console.log("Movie sections:", sections);

    await createMovie();

    setCurrentProcess("Adding the Assets to the Movie");

    sections.forEach(async (section) => {
      const { start, script, media, avatar, audio } = section;

      if (movieRef.current == null) {
        console.log("The Movie didn't get created properly: MovieRef is null");
        return;
      }

      const movie = movieRef.current;

      // Need to correc the fake start times!

      // TODO: add toasts here?
      const mediaLayer = await media;
      // const mediaLayer = fixLerpForMediaLayer(await media, start);
      mediaLayer.startTime = start;
      const avatarLayer = await avatar;
      avatarLayer.startTime = start;
      // const audioLayer = await audio;
      // audioLayer.startTime = start;
      // console.log("before detach");
      // mediaLayer.detach();
      // console.log("after detach");

      // mediaLayer.seek(start);
      // avatarLayer.seek(start);
      // audioLayer.seek(start);

      console.log("medias time", mediaLayer.currentTime);

      movie.addLayer(mediaLayer);
      movie.addLayer(avatarLayer);
      // movie.addLayer(audioLayer);

      setCurrentProcess(`${script.sectionName} assets added`);
    });

    setCurrentProcess("Movie Genreated!");
    setCurrentState("playback");
  };

  return (
    <div>
      <FramelessCard>
        <CardHeader>
          <CardTitle>Generate Video</CardTitle>
          <CardDescription>
            You video is ready to be generated and exported.
          </CardDescription>
        </CardHeader>
        {currentState === "initial" && (
          <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
            <Button
              className="ml-4"
              onClick={() => {
                generateMovie();
              }}
            >
              Generate Movie
              <MagicWandIcon />
            </Button>
          </Skeleton>
        )}
        {currentState === "playback" && (
          <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
            <Button
              className="ml-4"
              onClick={() => {
                movieRef.current?.play({
                  duration: 1.0,
                });
                setCurrentState("playing");
                console.log("playing");
                console.log(movieRef.current);
              }}
            >
              Play
              <PlayIcon />
            </Button>
          </Skeleton>
        )}
        <canvas
          className={`w-full mb-4 ${
            currentState === "playing" ? "" : "hidden"
          }`}
          ref={canvasRef}
        ></canvas>

        {currentState === "playing" && (
          <>
            <Button
              className=""
              onClick={() => {
                movieRef.current?.pause();
                setCurrentState("playback");
              }}
            >
              Pause
            </Button>
          </>
        )}
        {currentState === "playback" && (
          <>
            <Button
              className=""
              onClick={async () => {
                setCurrentState("rendering");
                await generateVideo();
                setCurrentState("playback");
              }}
            >
              Save as Video file
            </Button>
          </>
        )}
        {currentState === "loading" && (
          <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
            <Progress value={generationProgress} className="w-5/6 mt-4" />
            <p className="text-yellow-400">{currentProcess}</p>
          </Skeleton>
        )}
        <div></div>
      </FramelessCard>
      <Button
        onClick={() => {
          movieRef.current && movieRef.current.pause();
          movieRef.current && movieRef.current.seek(0);
          navigate("/presentation");
        }}
      >
        Back
      </Button>
    </div>
  );
};
