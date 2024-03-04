/**
 * @prettier
 */
// -> commit: acfdf4885ad8f2445b62e1c3dea0407d6ede2b10 is just before experimental etro stuff
import { Separator } from "@radix-ui/react-menu";
import React, { useEffect, useRef, useState } from "react";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { LocOps, ScriptData, SectionData } from "../../electron/mockData/data";
import { Button } from "../components/ui/button";
import etro from "etro";
import {
  addAudioLayer,
  addAvatarLayer,
  addImageLayer,
  addVideoLayer,
  dispatchSectionGeneration,
} from "../lib/etro-utils";
import { Skeleton } from "../components/ui/skeleton";
import { PlayIcon } from "lucide-react";
import { SubtitleText } from "../lib/subtitle-layer";
import { toast } from "sonner";

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
            layerOptions: dispatchSectionGeneration(
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

  function clearMovies() {
    Array.from(moviesState[0].values()).forEach((movie) => {
      movie.stop();
      // movie.layers.forEach((layer) => layer.detach());
      // movie.layers.slice(0, movie.layers.length);
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
                console.log("movies", moviesState[0]);
                console.log("info:", dataMap);
                clearMovies(); // not convinced this is doing anything
                console.log("movies", moviesState[0]);
                console.log("info:", dataMap);
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
    moviesState,
  }: {
    sectionDataMap: Map<string, SectionData>;
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
    let movie: etro.Movie;
    const existingMovie = movies.get(id); // check if new section has a movie created

    if (!existingMovie) {
      const canvas = canvasRef.current!;
      movie = new etro.Movie({
        canvas: canvas,
        repeat: false,
        background: etro.parseColor("#ccc"),
      });

      canvas.width = 1920;
      canvas.height = 1080;

      // add the assets to the movie:
      const { p_mediaOpts, p_avatarOpts, p_audioOpts } =
        sectionData.layerOptions;

      // Primary Media
      toastNotif(p_mediaOpts, section, "Media");
      addImageLayer(movie, await p_mediaOpts);

      // Avatar
      if (p_avatarOpts) {
        // avatar option might not be set in the project!
        toastNotif(p_avatarOpts, section, "Avatar");
        addAvatarLayer(movie, await p_avatarOpts);
      }
      // Audio
      // toastNotif(p_audioOpts, section, "Audio");
      // addAudioLayer(movie, await p_audioOpts)

      setMovies((map) => new Map(map.set(id, movie)));
    } else {
      movie = existingMovie;
    }

    movieRef.current = movie;
  };

  // Currently only moves the avatar around
  const restyleSection = async ({ preset }: { preset: LocOps }) => {
    // pause if a movie is playing
    !movieRef.current?.paused && movieRef.current?.pause();
    setCurrentState("restyling");

    console.log("1");
    const canvas = canvasRef.current!;
    console.log("2");
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });
    console.log("3");

    const { p_mediaOpts, p_avatarOpts, p_audioOpts } = sectionData.layerOptions;

    // Primary Media
    toastNotif(p_mediaOpts, section, "Media");
    addImageLayer(movie, await p_mediaOpts);

    console.log("4");

    // Avatar
    if (p_avatarOpts) {
      p_avatarOpts.then((opts) => {
        opts.x = preset.x ?? opts.x;
        opts.y = preset.y ?? opts.y;
        addAvatarLayer(movie, opts);
        console.log("5");
      });
    }
    console.log("6");

    // Audio
    // toastNotif(p_audioOpts, section, "Audio");
    // addAudioLayer(movie, await p_audioOpts)

    setMovies((map) => new Map(map.set(id, movie)));
    movieRef.current = movie;
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
              restyleSection({ preset: { x: 1408, y: 632 } });
            }}
          >
            {" "}
            Style 1{" "}
          </Button>
          <Button
            onClick={() => {
              restyleSection({ preset: { x: 0, y: 0 } });
            }}
          >
            {" "}
            Style 2{" "}
          </Button>
          <Button
            onClick={() => {
              restyleSection({ preset: { y: 300 } });
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
