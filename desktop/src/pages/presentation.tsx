/**
 * @prettier
 */
// -> commit: acfdf4885ad8f2445b62e1c3dea0407d6ede2b10 is just before experimental etro stuff
import { Separator } from "@radix-ui/react-menu";
import React, { useEffect, useRef, useState } from "react";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { LayerOpts, ScriptData } from "../../electron/mockData/data";
import { Button } from "../components/ui/button";
import etro from "etro";
import { addSingleImageLayer, addSectionAvatar } from "../lib/etro-utils";
import { Skeleton } from "../components/ui/skeleton";
import { MailOpen, PlayIcon } from "lucide-react";

type NavHeader = {
  // id: string;
  title: string;
  href: string;
};

type SectionData = {
  section: ScriptData;
  assetPromise: Promise<void>;
};

// new idea movie is created within the Child however its assets start loading here.

function dispatchMovie(data: ScriptData): Promise<void> {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

export const PresentationLayout: React.FC = () => {
  const navigate = useNavigate();

  const [isScriptReady, setIsScriptReady] = useState<boolean>(false);
  const [sections, setSections] = useState<NavHeader[]>([]);
  // const [script, setScript] = useState<ScriptData[]>();
  const [scriptMap, setScriptMap] = useState<Map<string, SectionData>>();

  useEffect(() => {
    window.api
      .getScript()
      .then((data: ScriptData[]) => {
        const map = new Map();

        console.log("setting script to", data);
        const temp: NavHeader[] = [];

        data.forEach((entry: ScriptData) => {
          const { id, sectionName } = entry;

          map.set(id, {
            section: entry,
            moviePromise: dispatchMovie(entry),
          });

          temp.push({
            title: sectionName,
            href: `/presentation/${id}`, // same as the one in App.tsx
          });

          setSections(temp);
          setScriptMap(map);
        });
      })
      .finally(() => {
        setIsScriptReady(true);
      });
  }, []);

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
                  <Outlet context={{ scriptMap }} />
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
            <Button onClick={() => navigate("/get-video")}> Next </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// export const PresentationSection: React.FC<{id: number; title: string;}> = ({id, title}) => {
export const PresentationSection: React.FC = () => {
  const param = useParams();
  const id = param.sectionId!;

  type CurrentState = "initial" | "playing" | "playback";
  const [currentState, setCurrentState] = useState<CurrentState>("initial");

  const movieRef = useRef<etro.Movie | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [movies, setMovies] = useState<Map<string, etro.Movie>>(new Map());
  // get from parent element
  const { scriptMap }: { scriptMap: Map<string, SectionData> } =
    useOutletContext();

  console.log("id of the section", id);
  const { section, assetPromise } = scriptMap.get(id)!;
  console.log("given Section", section);

  // useEffect(() => {
  //   assetPromise
  //     .then((movie) => {
  //       movieRef.current = movie;
  //     })
  //     .finally(() => setIsMovieReady(true));
  // }, [assetPromise]);
  useEffect(() => {
    setCurrentState("initial");
    if (canvasRef.current == undefined) {
      console.log("canvas is null");
      return;
    }
    console.log("here", id);

    setupPlayer().then(() => setCurrentState("playback"));
  }, [id]);

  // this will need some parameters to change the video by

  const setupPlayer = async () => {
    if (movieRef.current) {
      console.log("movie exist", movieRef.current);
      console.log("pausing if playing");
      !movieRef.current.paused && movieRef.current.pause();
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

      addSingleImageLayer(section, movie, 0); //Add image from the start
      await addSectionAvatar(section, movie, 0);
      setMovies((map) => new Map(map.set(id, movie)));
    } else {
      movie = existingMovie;
    }

    movieRef.current = movie;
  };

  const restyleSection = async ({ preset }: { preset: LayerOpts }) => {
    !movieRef.current?.paused && movieRef.current?.pause();
    setCurrentState("initial");
    // const movie = movieRef.current;

    // assert(movie, "Restyle: Movie must exist at this point"); // a movie reference must exist at this point
    const newMovie = new etro.Movie({
      canvas: canvasRef.current!,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    addSingleImageLayer(section, newMovie, 0);
    await addSectionAvatar(section, newMovie, 0, preset);
    setMovies((map) => new Map(map.set(id, newMovie)));
    movieRef.current = newMovie;
    setCurrentState("playback");
  };
  // const generateSectionEtro = async () => {
  //   await setupPlayer();
  //   setCurrentState("playback");
  // };

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
          <Button> Style 3 </Button>
        </div>
      </div>
    </>
  );
};
