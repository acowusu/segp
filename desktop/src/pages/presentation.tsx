/**
 * @prettier
 */
// -> commit: acfdf4885ad8f2445b62e1c3dea0407d6ede2b10 is just before experimental etro stuff
import { Separator } from "@radix-ui/react-menu";
import React, { useEffect, useRef, useState } from "react";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import {
  LayerOpts,
  Layers,
  ScriptData,
  SectionData,
} from "../../electron/mockData/data";
import { Button } from "../components/ui/button";
import etro from "etro";
import {
  addAudioLayer,
  addAvatarLayer,
  addImageLayer,
  addSubtitleLayer,
  dispatchSectionGeneration,
  generateAudio,
  parseLayerOptions,
  updateMetadataWithOpts,
} from "../lib/etro-utils";
import { Skeleton } from "../components/ui/skeleton";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { TextOptions, VideoOptions } from "etro/dist/layer";
import { s } from "vitest/dist/reporters-1evA5lom.js";

type NavHeader = {
  // id: string;
  title: string;
  href: string;
};

export const PresentationLayout: React.FC = () => {
  const navigate = useNavigate();

  const [isScriptReady, setIsScriptReady] = useState<boolean>(false);
  const [sections, setSections] = useState<NavHeader[]>([]);
  // const [script, setScript] = useState<ScriptData[]>();
  const [dataMap, setDataMap] = useState<Map<string, SectionData>>(new Map());

  // movieState cannot be removed this allows me to allow seemless switching between section tabs
  const moviesState = useState<Map<string, etro.Movie>>(new Map());

  useEffect(() => {
    window.api.getScript().then((data: ScriptData[]) => {
      console.log("setting script to", data);
      const temp: NavHeader[] = [];

      // this must be sync so the topics are in given order
      data.forEach((entry: ScriptData) => {
        const { id, sectionName } = entry;
        temp.push({
          title: sectionName,
          href: `/presentation/${id}`, // same as the one in App.tsx
        });
        setSections(temp);
      });

      const map = new Map(); // map of the id -> SectionData (consists of what the child will need later)
      let start = 0;

      // must be async as the dispatch needs to wait for audio get of the section
      const waitDispatch = data.map(async (entry: ScriptData) => {
        // no need to dispatch if these already exist just load layers
        const { id } = entry;

        // TODO: default to reading from script data if not present make defaults
        // can delegate this to the dispatch function?
        if (entry.assetLayerOptions) {
          const parsedOpts = await parseLayerOptions(0, entry);
          map.set(id, {
            start: start,
            script: entry,
            layerOptions: parsedOpts,
          });

          if (!entry.scriptDuration) {
            throw new Error(
              "presentation/useEffect-Parent: The duration of the script Section is not defined, should exist in metadata"
            );
          }

          start += entry.scriptDuration;
        } else {
          const { promisedOpts, modifiedSection: newEntry } =
            await dispatchSectionGeneration(
              // this await is for the initial audiogen, dration depends on it
              entry,
              0 // this is a fake start so that added layers start from the start MUST be changed fro videogen
            );
          map.set(id, {
            start: start, // real start time this is cached for later to videogen can quickly convert the layers
            script: newEntry, //has duration
            promisedLayerOptions: promisedOpts,
          });

          if (!newEntry.scriptDuration) {
            throw new Error(
              "presentation/useEffect-Parent: The duration of the script Section is not defined, audioGen should have done this"
            );
          }
          start += newEntry.scriptDuration; // should exist get sections will fail (do check!)
        }

        return;
      });
      setDataMap(map);
      Promise.all(waitDispatch).then(() => {
        setIsScriptReady(true);
      });
    });
  }, []);

  function stopMovies() {
    Array.from(moviesState[0].values()).forEach((movie) => {
      // movie.layers.forEach((layer) => {
      //   layer.detach();
      // });

      movie.stop();
    });
  }

  return (
    <>
      <div className=" space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Select Presentation Style
          </h2>
          <p className="text-muted-foreground">
            Choose the presentation options for the various sections of the
            video
          </p>
        </div>
        <div>
          {isScriptReady ? (
            <>
              <Separator className="my-6" />
              <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                  <SidebarNav items={sections} />
                </aside>
                <div className="flex-1 space-y-10 lg:max-w-2xl">
                  <Outlet
                    context={{
                      sectionDataMap: dataMap,
                      setSectionDataMap: setDataMap,
                      moviesState: moviesState,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              {" "}
              <p className="text-muted-foreground">Preparing Sections ... </p>
            </div>
          )}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/script-Editor")}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                stopMovies(); // not convinced this is doing anything
                console.log("sections?", dataMap.values());
                navigate("/get-video", {
                  state: {
                    sections: Array.from(dataMap.values()), // pass data into videogen?
                  },
                });
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

function toastNotif<T>(promise: Promise<T>, section: ScriptData, type: string) {
  toast.promise(promise, {
    loading: `Generating ${type} for ${section.sectionName}...`,
    success: () => {
      return `${type} generation is completed for ${section.sectionName}`;
    },
    error: `Error in ${type} layer creation in ${section.sectionName}`,
  });
}

// export const PresentationSection: React.FC<{id: number; title: string;}> = ({id, title}) => {
export const PresentationSection: React.FC = () => {
  const param = useParams();
  const id = param.sectionId!;

  type CurrentState = "initial" | "playing" | "playback" | "restyling";
  const [currentState, setCurrentState] = useState<CurrentState>("initial");

  const movieRef = useRef<etro.Movie | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // get from parent element
  const {
    sectionDataMap: dataMap,
    setSectionDataMap: setDataMap,
    moviesState,
  }: {
    sectionDataMap: Map<string, SectionData>;
    setSectionDataMap: React.Dispatch<
      React.SetStateAction<Map<string, SectionData>>
    >;
    moviesState: [
      Map<string, etro.Movie>,
      React.Dispatch<React.SetStateAction<Map<string, etro.Movie>>>
    ];
  } = useOutletContext();

  const [movies, setMovies] = moviesState;

  console.log("id of the section", id);
  const sectionData: SectionData = dataMap.get(id)!;
  const section = sectionData.script;
  console.log("given Section", section);

  useEffect(() => {
    console.log("in use effect of child, movies", movies);
    setCurrentState("initial");
    if (canvasRef.current == undefined) {
      console.log("canvas is null");
      return;
    }

    if (movieRef.current) {
      movieRef.current.stop();
    }

    const movie = movies.get(id);

    // if a movie already exists don;t make a new one
    if (movie) {
      movieRef.current = movie;
      setCurrentState("playback");
    } else {
      setupPlayer().then(() => setCurrentState("playback"));
    }
  }, [id]);

  // this will need some parameters to change the video by

  const setupPlayer = async () => {
    const canvas = canvasRef.current!;

    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    canvas.width = 1920;
    canvas.height = 1080;

    movieRef.current = movie;
    await addAssets(); // makes new layers with the default given sectionData
  };

  const updateMovie = async (opts?: LayerOpts) => {
    if (!movieRef.current) {
      throw new Error("Movie should exist now");
    }
    const movie = movieRef.current;

    const {
      mediaOpts: overrideMediaOpts,
      audioOpts: overrideAudioOpts,
      avatarOpts: overrideAvatarOpts,
      subtitleOpts: overrideSubtitleOpts,
      backingOpts: overrideBackingOpts,
      soundfxOpts: overrideSoundFxOpts,
    } = opts ?? {};

    // call with values that will be overrides
    if (!sectionData.layers) {
      throw new Error(
        "The layers must have been alreaedy created before restyling"
      );
    }

    const { media, audio, avatar, subtitle, backing, soundfx } =
      sectionData.layers;

    const currentLayerOptions = sectionData.layerOptions;
    avatar && (avatar.x = overrideAvatarOpts.x);
    avatar && (avatar.y = overrideAvatarOpts.y);

    sectionData.layers.avatar = avatar;
    currentLayerOptions &&
      (sectionData.layerOptions!.avatarOpts = {
        ...currentLayerOptions.avatarOpts,
        ...overrideAudioOpts,
      });

    //TODO: must also be written back to script here
    console.log("Section looks like:", sectionData);
    setDataMap((map) => map.set(id, sectionData));
    // movies map should be kept up to date, discard old movie
    // setMovies((map) => new Map(map.set(id, movie)));
  };

  // First time
  const addAssets = async () => {
    // overrries, if they don't exist do givens

    // populate as the promises resolve
    let finalOpts: LayerOpts = {};
    const finalLayers: Layers = {};

    if (!movieRef.current) {
      throw new Error(
        "presentation/addAssets: Movie should definitely be defined by now!"
      );
    }

    const movie = movieRef.current!;

    if (sectionData.layerOptions) {
      const {
        mediaOpts,
        audioOpts,
        avatarOpts,
        subtitleOpts,
        backingOpts,
        soundfxOpts,
      }: LayerOpts = sectionData.layerOptions!;

      // no overrides these are the only truths we know now only need the layers
      finalOpts = sectionData.layerOptions;

      if (mediaOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, mediaLayer] = addImageLayer(movie, mediaOpts);
        finalLayers.media = mediaLayer;
      }

      if (audioOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, audioLayer] = addAudioLayer(movie, audioOpts);
        finalLayers.audio = audioLayer;
      }

      if (avatarOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, avatarLayer] = addAvatarLayer(movie, avatarOpts);
        finalLayers.avatar = avatarLayer;
      }

      if (subtitleOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, subtitleLayer] = addSubtitleLayer(movie, subtitleOpts);
        finalLayers.subtitle = subtitleLayer;
      }

      if (backingOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, backingLayer] = addAudioLayer(movie, backingOpts);
        finalLayers.backing = backingLayer;
      }

      if (soundfxOpts) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, soundfxLayer] = addAudioLayer(movie, soundfxOpts);
        finalLayers.soundfx = soundfxLayer;
      }
    } else {
      // TODO add toasts here
      if (!sectionData.promisedLayerOptions) {
        throw new Error(
          "presentation/addAssets: the promises must now exist as the layer/options dont"
        );
      }

      const {
        p_mediaOpts,
        p_avatarOpts,
        p_audioOpts,
        p_subtitleOpts,
        p_backingOpts,
        p_soundfxOpts,
      } = sectionData.promisedLayerOptions!;

      // Change the Optionalness of some of these layers
      const waitMedia = p_mediaOpts?.then((opts) => {
        const [effOpts, layer] = addImageLayer(movie, opts);
        finalOpts.mediaOpts = effOpts;
        finalLayers.media = layer;
        console.log("passed media");
      });

      const waitAudio = p_audioOpts?.then((opts) => {
        const [effOpts, layer] = addAudioLayer(movie, opts);
        finalOpts.audioOpts = effOpts;
        finalLayers.audio = layer;
        console.log("passed audio");
      });

      const waitAvatar = p_avatarOpts?.then((opts) => {
        const [effOpts, layer] = addAvatarLayer(movie, opts);
        finalOpts.avatarOpts = effOpts;
        finalLayers.avatar = layer;
        console.log("passed avatar");
      });

      const waitSubtitle = p_subtitleOpts?.then((opts) => {
        // subtitles must be displayed above avatar
        waitAvatar?.then(() => {
          const [effOpts, layer] = addSubtitleLayer(movie, opts);
          finalOpts.subtitleOpts = effOpts;
          finalLayers.subtitle = layer;
        });
        console.log("passed subtitle");
      });

      const waitBacking = p_backingOpts?.then((opts) => {
        const [effOpts, layer] = addAudioLayer(movie, opts);
        finalOpts.backingOpts = effOpts;
        finalLayers.backing = layer;
        console.log("passed backing");
      });

      const waitSoundFx = p_soundfxOpts?.then((opts) => {
        const [effOpts, layer] = addAudioLayer(movie, opts);
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

      console.log("all asset layers are loaded into movie", movie);
      console.log("final asset options", finalOpts);
      sectionData.layerOptions = finalOpts;
      sectionData.layers = finalLayers;
      console.log("Secion looks like:", sectionData);
      setDataMap((map) => map.set(id, sectionData));
      setMovies((map) => map.set(id, movie));

      // TODO: once settings are added we also want to save them to metadata,
      // add here with an await and then add that promise to big waiter
      // sectionData.script.assetLayerOptions = finalOpts; // DO THIS anyway?
      // const newScript: ScriptData = sectionData.script;
      // console.log("new script with opts", newScript);
      console.log("starting update opts");
      await updateMetadataWithOpts(sectionData.script, finalOpts);
    }
  };

  // Currently only moves the avatar around
  const restyleSection = async ({ preset }: { preset: LayerOpts }) => {
    // pause if a movie is playing
    !movieRef.current?.paused && movieRef.current?.pause();
    movieRef.current && movieRef.current.stop();
    setCurrentState("restyling");

    await updateMovie(preset);

    setCurrentState("playback");
  };

  return (
    <>
      <div>
        <h3 className="text-xl font-bold tracking-tight">
          {section.sectionName}
        </h3>
        <p> {section.scriptTexts[section.selectedScriptIndex]}</p>
      </div>
      <div>
        {currentState === "initial" && (
          <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
            <p> Loading Section...</p>
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
        {/* <div className="relative w-full mb-4"> */}
        <canvas
          className={` w-full mb-4 ${
            currentState === "playing" ? "" : "hidden"
          }`}
          ref={canvasRef}
        ></canvas>{" "}
        {/* <Button className="relative top-[50%] left-[50%] translate-x-[50%] -translate-y-full -ms-[50%]">
            Dummy{" "}
          </Button>
        </div> */}
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
        {(currentState === "playback" || currentState === "playing") && (
          <div>
            <h3> Styles: </h3>
            <Button
              onClick={() => {
                restyleSection({ preset: { avatarOpts: { x: 1408, y: 632 } } });
              }}
            >
              {" "}
              Style 1{" "}
            </Button>
            <Button
              onClick={() => {
                restyleSection({ preset: { avatarOpts: { x: 0, y: 0 } } });
              }}
            >
              {" "}
              Style 2{" "}
            </Button>
            <Button
              onClick={() => {
                restyleSection({ preset: { avatarOpts: { x: 0, y: 300 } } });
              }}
            >
              {" "}
              Style 3{" "}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
