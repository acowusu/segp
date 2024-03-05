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
} from "../lib/etro-utils";
import { Skeleton } from "../components/ui/skeleton";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { TextOptions, VideoOptions } from "etro/dist/layer";

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
    window.api
      .getScript()
      .then((data: ScriptData[]) => {
        const map = new Map();

        console.log("setting script to", data);
        const temp: NavHeader[] = [];

        let start = 0;
        data.forEach((entry: ScriptData) => {
          const { id, sectionName } = entry;

          if (!entry.scriptDuration) {
            throw new Error(
              "The duration of the script Section is not defined"
            );
          }
          // TODO: default to reading from script data if not present make defaults
          // can delegate this to the dispatch function?
          map.set(id, {
            start: start, // real start time this is cached for later to videogen can quickly convert the layers
            script: entry,
            promisedLayerOptions: dispatchSectionGeneration(
              entry,
              0 // this is a fake start so that added layers start from the start MUST be changed fro videogen
            ),
          });

          start += entry.scriptDuration; // should exist get sections will fail (do check!)

          temp.push({
            title: sectionName,
            href: `/presentation/${id}`, // same as the one in App.tsx
          });

          setSections(temp);
          setDataMap(map);
        });
      })
      .finally(() => {
        setIsScriptReady(true);
      });
  }, []);

  function stopMovies() {
    Array.from(moviesState[0].values()).forEach((movie) => {
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
              <p className="text-muted-foreground">Loading Script ... </p>
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

    setupPlayer().then(() => setCurrentState("playback"));
  }, [id]);

  // this will need some parameters to change the video by

  const setupPlayer = async () => {
    if (movieRef.current) {
      console.log("movie exist", movieRef.current);
      console.log("pausing if playing");
      !movieRef.current.paused && movieRef.current.pause();
      // movieRef.current.stop();
    }
    await updateMovie(); // makes new layers with the default given sectionData
  };

  const updateMovie = async (opts?: LayerOpts) => {
    const canvas = canvasRef.current!;
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    canvas.width = 1920;
    canvas.height = 1080;

    movieRef.current = movie;

    // call with values that will be overrides
    await addAssets(opts);

    // movies map should be kept up to date, discard old movie
    setMovies((map) => new Map(map.set(id, movie)));
  };

  const addAssets = async (opts?: LayerOpts) => {
    // overrries, if they don't exist do givens
    const {
      mediaOpts: overrideMediaOpts,
      audioOpts: overrideAudioOpts,
      avatarOpts: overrideAvatarOpts,
      subtitleOpts: overrideSubtitleOpts,
      backingOpts: overrideBackingOpts,
      soundfxOpts: overrideSoundFxOpts,
    } = opts ?? {};

    // populate as the promises resolve
    const finalOpts: LayerOpts = {};

    if (!movieRef.current) {
      throw new Error(
        "presentation/addAssets: Movie should definitely be defined by now!"
      );
    }
    const movie = movieRef.current!;
    if (sectionData.layerOptions) {
      // all promises must have been already reslved
      const {
        mediaOpts,
        audioOpts,
        avatarOpts,
        subtitleOpts,
        backingOpts,
        soundfxOpts,
      } = sectionData.layerOptions ?? {};

      mediaOpts &&
        (finalOpts.mediaOpts = addImageLayer(
          movie,
          mediaOpts,
          overrideMediaOpts
        ));

      audioOpts &&
        (finalOpts.audioOpts = addAudioLayer(
          movie,
          audioOpts,
          overrideAudioOpts
        ));

      avatarOpts &&
        (finalOpts.avatarOpts = addAvatarLayer(
          movie,
          avatarOpts,
          overrideAvatarOpts
        ));

      // do subs after avatar
      subtitleOpts &&
        (finalOpts.subtitleOpts = addSubtitleLayer(
          movie,
          subtitleOpts,
          overrideSubtitleOpts
        ));

      backingOpts &&
        (finalOpts.backingOpts = addAudioLayer(
          movie,
          backingOpts,
          overrideBackingOpts
        ));

      soundfxOpts &&
        (finalOpts.soundfxOpts = addAudioLayer(
          movie,
          soundfxOpts,
          overrideSoundFxOpts
        ));
    } else {
      // otherwise the layeroptions are not yet resolved must wait for them
      // TODO add toasts here
      const {
        p_mediaOpts,
        p_avatarOpts,
        p_audioOpts,
        p_subtitleOpts,
        p_backingOpts,
        p_soundfxOpts,
      } = sectionData.promisedLayerOptions;

      // Change the Optionalness of some of these layers
      const waitMedia = p_mediaOpts.then((opts) => {
        finalOpts.mediaOpts = addImageLayer(movie, opts, overrideMediaOpts);
      });

      const waitAudio = p_audioOpts?.then((opts) => {
        finalOpts.audioOpts = addAudioLayer(movie, opts, overrideAudioOpts);
      });

      const waitAvatar = p_avatarOpts?.then((opts) => {
        finalOpts.avatarOpts = addAvatarLayer(movie, opts, overrideAvatarOpts);
      });

      const waitSubtitle = p_subtitleOpts?.then((opts) => {
        // subtitles must be displayed above avatar
        waitAvatar?.then(() => {
          finalOpts.subtitleOpts = addSubtitleLayer(
            movie,
            opts,
            overrideSubtitleOpts
          );
        });
      });

      const waitBacking = p_backingOpts?.then((opts) => {
        finalOpts.backingOpts = addAudioLayer(movie, opts, overrideBackingOpts);
      });

      const waitSoundFx = p_soundfxOpts?.then((opts) => {
        finalOpts.soundfxOpts = addAudioLayer(movie, opts, overrideSoundFxOpts);
      });

      await Promise.all([
        waitMedia,
        waitAudio,
        waitAvatar,
        waitSubtitle,
        waitBacking,
        waitSoundFx,
      ]);
    }

    console.log("all asset layers are loaded into movie", movie);
    console.log("final asset options", finalOpts);
    sectionData.layerOptions = finalOpts;
    // setDataMap((map) => map.set(id, sectionData));

    // TODO: once settings are added we also want to save them to metadata,
    // add here with an await and then add that promise to big waiter
  };

  // Currently only moves the avatar around
  const restyleSection = async ({ preset }: { preset: LayerOpts }) => {
    // pause if a movie is playing
    !movieRef.current?.paused && movieRef.current?.pause();
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
              restyleSection({ preset: { avatarOpts: { y: 300 } } });
            }}
          >
            {" "}
            Style 3{" "}
          </Button>
        </div>
      </div>
    </>
  );
};
