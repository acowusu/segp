/**
 * @prettier
 */
// -> commit: acfdf4885ad8f2445b62e1c3dea0407d6ede2b10 is just before experimental etro stuff
import { Separator } from "@radix-ui/react-menu";
import React, { useEffect, useRef, useState } from "react";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { ScriptData } from "../../electron/mockData/data";
import { Button } from "../components/ui/button";
import etro from "etro";
import { addSingleImageLayer } from "../lib/etro-utils";

type NavHeader = {
  // id: string;
  title: string;
  href: string;
};

type SectionData = {
  section: ScriptData;
  moviePromise: Promise<etro.Movie>;
};

function dispatchMovie(
  data: ScriptData,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
): Promise<etro.Movie> {
  return new Promise((resolve, reject) => {
    if (canvasRef.current == undefined) {
      reject(new Error("Presentation Layout: canvas is not defined"));
      return;
    }

    const canvas = canvasRef.current;
    const movie = new etro.Movie({
      canvas: canvas,
      repeat: false,
      background: etro.parseColor("#ccc"),
    });

    addSingleImageLayer(data, movie, 0); //Add image from the start
    resolve(movie);
  });
}

export const PresentationLayout: React.FC = () => {
  const navigate = useNavigate();

  const [isScriptReady, setIsScriptReady] = useState<boolean>(false);
  const [sections, setSections] = useState<NavHeader[]>([]);
  // const [script, setScript] = useState<ScriptData[]>();
  const [scriptMap, setScriptMap] = useState<Map<string, SectionData>>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
            moviePromise: dispatchMovie(entry, canvasRef),
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
        {isScriptReady ? (
          <>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
              <aside className="-mx-4 lg:w-1/5">
                <SidebarNav items={sections} />
              </aside>
              <canvas className={`w-full mb-4`} ref={canvasRef}></canvas>
              <div className="flex-1 space-y-10 lg:max-w-2xl">
                <Outlet context={{ scriptMap }} />
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
        ) : (
          <div>
            {" "}
            <p className="text-muted-foreground">Loading Script ... </p>
          </div>
        )}
      </div>
    </>
  );
};

// export const PresentationSection: React.FC<{id: number; title: string;}> = ({id, title}) => {
export const PresentationSection: React.FC = () => {
  const param = useParams();
  const id = param.sectionId!;

  const [isMovieReady, setIsMovieReady] = useState<boolean>(false);
  const movieRef = useRef<etro.Movie | null>();
  // get from parent element
  const { scriptMap }: { scriptMap: Map<string, SectionData> } =
    useOutletContext();

  console.log("id of the section", id);
  const { section, moviePromise } = scriptMap.get(id)!;
  console.log("given Section", section);
  useEffect(() => {
    moviePromise
      .then((movie) => {
        movieRef.current = movie;
      })
      .finally(() => setIsMovieReady(true));
  }, [moviePromise]);
  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight">
        {section.sectionName}
      </h3>
      <p> {section.scriptTexts[section.selectedScriptIndex]}</p>
      <Button
        disabled={!isMovieReady}
        onClick={() => {
          movieRef.current!.play();
        }}
      >
        {" "}
        Play
      </Button>
    </div>
  );
};
