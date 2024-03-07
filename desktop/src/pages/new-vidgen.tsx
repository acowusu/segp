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
import { LayerOpts, Layers, SectionData } from "../../electron/mockData/data";
import {
  addAudioLayer,
  addAvatarLayer,
  addImageLayer,
  addSubtitleLayer,
  fixLerpForMediaLayer,
  getMediaLayer,
  updateMetadataWithOpts,
} from "../lib/etro-utils";
import {
  AudioOptions,
  BaseOptions,
  ImageOptions,
  TextOptions,
  VideoOptions,
} from "etro/dist/layer";
import { layer } from "etro/dist/etro";

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
    if (movieRef.current == null) {
      console.log("The Movie didn't get created properly: MovieRef is null");
      return;
    }
    const movie = movieRef.current;

    sections.forEach(async (section) => {
      const { start, script, promisedLayerOptions, layerOptions, layers } =
        section;

      // !!! Need to correct the fake start times!

      if (layerOptions && layers) {
        // these should always exist together, maybe group them in a type?

        // if these exist then all the generation is completed, so just load these options
        const {
          mediaOpts,
          audioOpts,
          avatarOpts,
          subtitleOpts,
          backingOpts,
          soundfxOpts,
        } = layerOptions;
        const { avatar } = layers;

        console.log("Existing layerOptions", layerOptions);
        // Media:
        if (mediaOpts) {
          addImageLayer(movie, mediaOpts, { startTime: start } as ImageOptions);
        }

        if (audioOpts) {
          addAudioLayer(movie, audioOpts, { startTime: start } as AudioOptions);
        }

        // Avatar
        // addAvatarLayer(movie, avatarOpts, { startTime: start } as VideoOptions); DOES NOT WORK
        if (avatar) {
          avatar.startTime = start;
          movie.addLayer(avatar);
        }
        console.log("Done adding layers");
      } else {
        // TODO: add toasts here?
        // Primary Media
        if (!promisedLayerOptions) {
          throw new Error(
            "new-vidgen/generateMovie: the promises must now exist as the layer/options dont"
          );
        }
        const {
          p_mediaOpts,
          p_avatarOpts,
          p_audioOpts,
          p_subtitleOpts,
          p_backingOpts,
          p_soundfxOpts,
        } = promisedLayerOptions!; // if no layers or opts exist promises must exist

        const finalOpts: LayerOpts = {};
        const finalLayers: Layers = {};

        // Change the Optionalness of some of these layers
        const waitMedia = p_mediaOpts?.then((opts) => {
          const [effOpts, layer] = addImageLayer(movie, opts, {
            startTime: start,
          } as ImageOptions);
          finalOpts.mediaOpts = effOpts;
          finalLayers.media = layer;
          console.log("passed media");
        });

        const waitAudio = p_audioOpts?.then((opts) => {
          const [effOpts, layer] = addAudioLayer(movie, opts, {
            startTime: start,
          } as AudioOptions);
          finalOpts.audioOpts = effOpts;
          finalLayers.audio = layer;
          console.log("passed audio");
        });

        const waitAvatar = p_avatarOpts?.then((opts) => {
          const [effOpts, layer] = addAvatarLayer(movie, opts, {
            startTime: start,
          } as VideoOptions);
          finalOpts.avatarOpts = effOpts;
          finalLayers.avatar = layer;
          console.log("passed avatar");
        });

        const waitSubtitle = p_subtitleOpts?.then((opts) => {
          // subtitles must be displayed above avatar
          waitAvatar?.then(() => {
            const [effOpts, layer] = addSubtitleLayer(movie, opts, {
              startTime: start,
            } as TextOptions);
            finalOpts.subtitleOpts = effOpts;
            finalLayers.subtitle = layer;
          });
          console.log("passed subtitle");
        });

        const waitBacking = p_backingOpts?.then((opts) => {
          const [effOpts, layer] = addAudioLayer(movie, opts, {
            startTime: start,
          } as AudioOptions);
          finalOpts.backingOpts = effOpts;
          finalLayers.backing = layer;
          console.log("passed backing");
        });

        const waitSoundFx = p_soundfxOpts?.then((opts) => {
          const [effOpts, layer] = addAudioLayer(movie, opts, {
            startTime: start,
          } as AudioOptions);
          finalOpts.soundfxOpts = effOpts;
          finalLayers.soundfx = layer;
          console.log("passed soundfx");
        });

        await Promise.all([
          waitMedia,
          waitAudio,
          waitAvatar,
          waitSubtitle,
          waitBacking,
          waitSoundFx,
        ]);
        // }

        console.log("Vidgen: all asset layers are loaded into movie", movie);
        console.log("Vidgen: final asset options", finalOpts);
        // sectionData.layerOptions = finalOpts;
        // sectionData.layers = finalLayers;

        console.log("starting update opts");
        await updateMetadataWithOpts(script, finalOpts);
      }

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
