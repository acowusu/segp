import React, { useRef, useState } from "react";
// import { MediaStore } from "../contexts/media/mediaStore";
import { Progress } from "../components/ui/progress";
import etro from "etro";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ScriptData } from "../../electron/mockData/data";
import { MagicWandIcon, PlayIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CardDescription, CardHeader, CardTitle, FramelessCard } from "../components/ui/card";
import { addAudioLayers, addAvatarLayers, addMediaLayers, addSubtitleLayers, generateAudio, generateAvatarSections } from "../lib/video-utils";


/** TODOs:
 * -> settigns needs to be added, from the previous tabs? most important is aspect ratio
 * -> support other layers, audio
 * -> overlaiying of visual layers for subtitles on top of the visuals
 */
export const VideoGenerator: React.FC = () => {
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentProcess, setCurrentProcess] = useState<string>("");
  const [currentState, setCurrentState] = useState<string>("initial");
  const [script, setScript] = useState<ScriptData[]>([]);
  const updateScript = async () => {
    window.api.getScript().then( async (script) => {
      setScript(script);
    });
  };
  // useEffect(() => {
  //   setupPlayer();
  // }, []);
  const setupPlayer = async () => {
    if (canvasRef.current == undefined) {
      console.log("canvas is null");
      return;
    }
    if (movieRef.current != undefined) {
      console.log("movieRef is not null");
      return;
    }
    const canvas = canvasRef.current;
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#e74c3c"),
    });
    canvas.width = 1920;
    canvas.height = 1080;
    console.log("setting up player", movie);
    const script = await window.api.getScript();
    await addAudioLayers(script, movie);

    await addMediaLayers(script, movie);

    await toast.promise(addAvatarLayers(script, movie).then(async () => await addSubtitleLayers(script, movie)), {
      loading: `Adding Avatar Layers...`,
      success: `Avatar Layers have been added.  `,
      error: (error)=> `Error adding Avatar Layers ${error}` ,
    })

    movieRef.current = movie;
    console.log("movieRef", movieRef.current);
  };

  const generateEtro = async () => {
    setCurrentProcess("Starting");
    setCurrentState("etro");
    await generateAudio();
    await generateAvatarSections();
    console.log("audio generated backing should exist");

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 95) return prev + 0.1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    await updateScript();
    console.log("script", script);
    await setupPlayer();
    console.log("Movie should be setup", movieRef.current);

    setCurrentProcess("Done");
    setGenerationProgress(0);
    setCurrentState("playback");
  };

  const generateVideo = async () => {
    setCurrentProcess("Recording");


    setGenerationProgress(10);
    let interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 50) return prev + 0.1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    const blob: Blob = (await movieRef.current?.record({
      frameRate: 24,
      type: 'video/webm;codecs=h264',
      audio: true,
      video: true,
      // duration: default end of video
      // onStart: optional callback
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onStart: (_: MediaRecorder) => {
        console.log("recording started");
        setCurrentProcess("Recording");
      },
    })) as Blob;
    setGenerationProgress(20);
    const newBlob = new Blob([blob!], { type: "video/webm" });

    clearInterval(interval);
    setGenerationProgress(50);
    // start the mp4 conversion here
    setCurrentProcess("Converting to mp4");
    console.log("starting the mp4 conversion");
    const buff = await newBlob.arrayBuffer();
    setGenerationProgress(70);
    interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 90) return prev + 0.1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    setCurrentProcess("Post processing mp4");
    await window.api.prepareMp4Blob(buff);
    clearInterval(interval);
    setGenerationProgress(90);
    setCurrentProcess("Finishing up");
    console.log("got the mp4 data back making blob");

    console.log("mp4 conversion done");
    setGenerationProgress(100);
    // setVideoBlob(newBlob);
    setCurrentProcess("Done");
    console.log("recording complete");
  };

  return (
    <div>
      <FramelessCard className="flex flex-col gap-4" >
        <CardHeader>
          <CardTitle>Generate Video</CardTitle>
          <CardDescription>
            You video is ready to be generated and exported.


          </CardDescription>
        </CardHeader>

        <div className="flex flex-row gap-8">
          {currentState === "initial" && (
          <Skeleton className="aspect-video	 w-4/5 mb-4 flex align-center items-center justify-center flex-col	">
            <Button
              className="ml-4"
              onClick={() => {
                generateEtro();
              }}
            >
              Generate Audio
              <MagicWandIcon />
            </Button>
          </Skeleton>
        )}
        {currentState === "playback" && (
          <Skeleton className="aspect-video	 w-4/5 mb-4 flex align-center items-center	justify-center flex-col	">
            <Button
              className="ml-4"
              onClick={() => {
                movieRef.current?.play();
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
          className={`w-4/5 mb-4 ${currentState === "playing" ? "" : "hidden"}`}
          ref={canvasRef}
        ></canvas>
        {(currentState === "rendering" || currentState === "etro") && (
          <Skeleton className="aspect-video	 w-4/5 mb-4 flex align-center items-center	justify-center flex-col	">
            <Progress value={generationProgress} className="w-5/6 mt-4" />
            <p>{currentProcess}</p>
          </Skeleton>
        )}

        <div className="flex flex-col gap-8 flex-grow">
          <Button onClick={() => navigate("/script-editor")}>
            Return to script editor
          </Button>

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

        </div>
        </div>


      </FramelessCard>
    </div>
  );
};
