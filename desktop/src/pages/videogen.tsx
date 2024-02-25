/**
 * @prettier
 */
import React, { useEffect, useRef, useState } from "react";
import { Progress } from "../components/ui/progress";
import etro from "etro";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { SubtitleText } from "../lib/subtitle-layer";
import { ScriptData } from "../../electron/mockData/data";
import { MagicWandIcon, PlayIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
const WIDTH = 1920;
const HEIGHT = 1080;
function lerp(a: number, b: number, t: number, p: number) {
  return a + (b - a) * (t / p);
}
function addImageLayers(sections: ScriptData[], movie: etro.Movie) {
  let start = 0;
  sections.forEach((section: ScriptData) => {
    if (!section.scriptMedia) throw new Error("No media found");
    if (!section.scriptDuration) throw new Error("No duration found");
    const layer = new etro.layer.Image({
      startTime: start,
      duration: section.scriptDuration,
      source: "local:///" + section.scriptMedia,
      destX: (_element: etro.EtroObject, time: number) => {
        return lerp(0, -WIDTH / 10, time, section.scriptDuration!);
      }, // default: 0
      destY: (_element: etro.EtroObject, time: number) => {
        return lerp(0, -HEIGHT / 10, time, section.scriptDuration!);
      }, // default: 0
      destWidth: (_element: etro.EtroObject, time: number) => {
        return lerp(WIDTH, WIDTH * 1.2, time, section.scriptDuration!);
      }, // default: null (full width)
      destHeight: (_element: etro.EtroObject, time: number) => {
        return lerp(HEIGHT, HEIGHT * 1.2, time, section.scriptDuration!);
      },
      x: 0, // default: 0
      y: 0, // default: 0
      sourceWidth: WIDTH,
      sourceHeight: HEIGHT,
      opacity: 1, // default: 1
    });
    console.log("adding layer", layer);
    start += section.scriptDuration;
    movie.layers.push(layer);
  });
}

function addSubtitleLayers(sections: ScriptData[], movie: etro.Movie) {
  let start = 0;
  sections.forEach((section: ScriptData) => {
    if (!section.scriptMedia) throw new Error("No media found");
    if (!section.scriptDuration) throw new Error("No duration found");
    const layer = new SubtitleText({
      startTime: start,
      duration: section.scriptDuration,
      text: section.scriptTexts[section.selectedScriptIndex],
      x: 0, // default: 0
      y: 0, // default: 0
      opacity: 1, // default: 1
      color: etro.parseColor("white"), // default: new etro.Color(0, 0, 0, 1)
      font: "50px sans-serif", // default: '10px sans-serif'
      textX: WIDTH / 2, // default: 0
      textY: HEIGHT, // default: 0
      textAlign: "center", // default: 'left'
      textBaseline: "alphabetic", // default: 'alphabetic'
      textDirection: "ltr", // default: 'ltr'
      background: new etro.Color(0, 0, 0, 0.0), // default: null (transparent)
    });
    movie.layers.push(layer);
    console.log("adding layer", layer);

    start += section.scriptDuration;
  });
}

async function addAudioLayers(sections: ScriptData[], movie: etro.Movie) {
  let start = 0;
  console.log("adding audio layers", sections);
  for (const section of sections) {
    if (!section.scriptAudio) throw new Error("No media found");
    if (!section.scriptDuration) throw new Error("No duration found");
    const layer = new etro.layer.Audio({
      startTime: start,
      duration: section.scriptDuration,
      source: await window.api.toDataURL(section.scriptAudio),
      sourceStartTime: 0, // default: 0
      muted: false, // default: false
      volume: 1, // default: 1
      playbackRate: 1, //default: 1
    });
    movie.layers.push(layer);
    console.log("adding layer", layer);

    start += section.scriptDuration;
  }
}
const generateAudio = async () => {
  try {
    const initial = await window.api.getScript();
    const result = [];
    for (const section of initial) {
      if (section.scriptAudio) {
        result.push(section);
        continue;
      }
      const modified = window.api.textToAudio(section);
      toast.promise(modified, {
        loading: `Generating audio for ${section.sectionName}...`,
        success: (newSection) => {
          return `Audio has been generated for ${section.sectionName}. ${newSection.scriptAudio} has been saved.`;
        },
        error: "Error generating audio for section: " + section.sectionName,
      });
      const resolvedModified = await modified;
      result.push(resolvedModified);
    }
    // const length = result.reduce((acc, val) => {
    //   return acc + val.scriptDuration!;
    // }, 0);
    // const track =  window.api.generateBackingTrack("inspiring emotionally charged uplidting corportate music vocals tones",length/2 )
    // toast.promise(track, {
    //   loading: `Generating backing track...`,
    //   success: (newSection) => {
    //     return `Backing track has been generated. ${newSection.audioSrc} has been saved.`;
    //   },
    //   error: (error)=>`Error generating backing track <em>${error}</em>` ,
    // });
    // await window.api.setProjectBackingTrack(await track);
    await window.api.setScript(result);
  } catch (error) {
    console.error("Error generating audio:", error);
  }
};

const addAvatarLayers = async (sections: ScriptData[], movie: etro.Movie) => {
  let start = 0;
  for (const section of sections) {
    if (!section.avatarVideoUrl) throw new Error("No avatarURL found");
    if (!section.scriptDuration) throw new Error("No duration found");
    const layer = new etro.layer.Video({
      startTime: start,
      duration: section.scriptDuration,
      source: section.avatarVideoUrl,
      destX: 0, // default: 0
      destY: 0, // default: 0
      destWidth: WIDTH, // default: null (full width)
      destHeight: HEIGHT, // default: null (full height)
      x: 0, // default: 0
      y: 0, // default: 0
      opacity: 1, // default: 1
    });
    movie.layers.push(layer);
    console.log("adding layer", layer);

    start += section.scriptDuration;
  }
};

const generateAvatarSections = async () => {
  if (!window.api.getProjectHasAvatar()) {
    console.log("No Avatar Option Selected. Skipping Avatar Generation... ");
    return;
  }
  try {
    const initial = await window.api.getScript();
    const result = [];
    const avatar = await window.api.getProjectAvatar();
    for (const section of initial) {
      const modified = window.api.generateAvatar(section, avatar);
      console.log("modified");
      toast.promise(modified, {
        loading: `Generating avatar for ${section.sectionName}...`,
        success: (_) => {
          return `Avatar has been generated for ${section.sectionName}. `;
        },
        error: "Error generating avatar for section: " + section.sectionName,
      });
      const resolvedModified = await modified;
      result.push(resolvedModified);
    }
    console.log("Updating Script with Avatar");
    window.api.setScript(result);
    console.log("Avatar Generation Complete");
  } catch (error) {
    console.error("Error generating avatar:", error);
  }
};

/** TODOs:
 * -> settigns needs to be added, from the previous tabs? most important is aspect ratio
 */
export const VideoGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();
  const [videoURL, setVideoURL] = useState<string>();
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isGenerateClicked, setIsGenerateClicked] = useState<boolean>(false);
  const [isDownloadStarted, setIsDownloadStarted] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentProcess, setCurrentProcess] = useState<string>("");
  const [isMp4Ready, setIsMp4Ready] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string>("initial");
  // this is now used to store the mp4 blob
  const [videoBlob, setVideoBlob] = useState<Blob>();
  const [script, setScript] = useState<ScriptData[]>([]);
  const updateScript = async () => {
    window.api.getScript().then(async (script) => {
      console.log("updating script");
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
      background: etro.parseColor("#ccc"),
    });
    canvas.width = 1920;
    canvas.height = 1080;

    console.log("setting up player", movie);
    const script = await window.api.getScript();
    await addAudioLayers(script, movie);
    addImageLayers(script, movie);
    // addSubtitleLayers(script, movie);
    movieRef.current = movie;
    console.log("movieRef", movieRef.current);
  };

  // const downloadAsMp4 = async () => {
  //   setCurrentProcess("Selecting the path to download Mp4...");
  //   setGenerationProgress(10);

  //   window.api.getDirectory().then(async (path: string) => {
  //     console.log(`download path = ${path}`);

  //     if (path === "" || path === undefined || path === null) {
  //       console.log("No download path selected"); // TODO: make this an alert popup
  //       return;
  //     }

  //     if (isVideoReady) {
  //       setIsDownloadStarted(true);
  //       console.log(`download path  = ${path}`);
  //       setCurrentProcess("Preparing the video");
  //       setGenerationProgress(20);
  //       const buff = await webmBlob!.arrayBuffer(); // exists becuaase of isVideoReady

  //       setCurrentProcess("Starting the mp4 Conversion");
  //       const interval = setInterval(() => {
  //         setGenerationProgress((prev) => {
  //           if (prev < 95) return prev + 0.2;
  //           clearInterval(interval);
  //           return prev;
  //         });
  //       }, 50);

  //       setCurrentProcess("Writing to mp4");
  //       window.api.webmDataToMp4File(buff, path).then(() => {
  //         clearInterval(interval);
  //         setGenerationProgress(100);
  //         setCurrentProcess("Downloaded");
  //       });
  //     } else {
  //       console.log("Video is not ready, cannot convert to mp4");
  //     }
  //   });
  // };

  const downloadVideo = async () => {
    if (isMp4Ready) {
      const url = URL.createObjectURL(videoBlob!);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video.mp4";
      a.click();
    } else {
      console.log("mp4 not ready");
    }
  };

  const generateEtro = async () => {
    setCurrentProcess("Starting");
    setCurrentState("etro");
    await generateAudio();
    console.log("audio generated backing should exist");
    const mock = [
      {
        id: "1",
        sectionName: "Section 1",
        scriptTexts: ["Hello World"],
        selectedScriptIndex: 0,
        sadTalkerPath: "/www/sadtalker_assets/driven_audio/1.wav",
        scriptDuration: 4,
      },
      // {
      //   "id": "2",
      //   "sectionName": "Section 2",
      //   "scriptTexts": ["Hello World"],
      //   "selectedScriptIndex": 0,
      //   "sadTalkerPath": "/www/sadtalker_assets/driven_audio/1.wav",
      //   "scriptDuration": 4,
      // }
    ];
    window.api.setProjectScript(mock);
    await generateAvatarSections();

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

    setIsVideoReady(true); // change the display
    setCurrentProcess("Done");
    setGenerationProgress(0);
    setCurrentState("playback");
  };

  const generateVideo = async () => {
    setCurrentProcess("Starting");
    const makeMp4Blob = (buff: ArrayBuffer) => {
      setVideoBlob(new Blob([buff], { type: "video/mp4" }));
      setIsMp4Ready(true);
    };

    setGenerationProgress(10);
    let interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 50) return prev + 0.1;
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
    setGenerationProgress(20);
    const newBlob = new Blob([blob!], { type: "video/webm" });
    const url = URL.createObjectURL(newBlob);
    setVideoURL(url); // set the url so we can play
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
    const mp4 = await window.api.prepareMp4Blob(buff);
    clearInterval(interval);
    setGenerationProgress(90);
    setCurrentProcess("Finishing up");
    console.log("got the mp4 data back making blob");

    makeMp4Blob(mp4);
    console.log("mp4 conversion done");
    setGenerationProgress(100);
    // setVideoBlob(newBlob);
    setCurrentProcess("Done");
    console.log("recording complete");
    setIsVideoReady(true); // change the display
  };

  return (
    <div>
      <h1> Video Generation </h1>
      {currentState === "initial" && (
        <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
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
        <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
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
        className={`w-full mb-4 ${currentState === "playing" ? "" : "hidden"}`}
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
      {currentState === "rendering" && (
        <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
          <Progress value={generationProgress} className="w-5/6 mt-4" />
          <p className="text-yellow-400">{currentProcess}</p>
        </Skeleton>
      )}
      <div></div>
    </div>
  );
};
