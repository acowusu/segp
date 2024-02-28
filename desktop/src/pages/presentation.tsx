/**
 * @prettier
 */

import { Separator } from "@radix-ui/react-menu";
import React, { useContext, useEffect, useState } from "react";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { boolean } from "zod";
import { ScriptData } from "../../electron/mockData/data";
import { Button } from "../components/ui/button";

type NavHeader = {
  // id: string;
  title: string;
  href: string;
};
export const PresentationLayout: React.FC = () => {
  const navigate = useNavigate();

  const [isScriptReady, setIsScriptReady] = useState<boolean>(false);
  const [sections, setSections] = useState<NavHeader[]>([]);
  const [script, setScript] = useState<ScriptData[]>();
  useEffect(() => {
    window.api
      .getScript()
      .then((data) => {
        setScript(data);
        console.log("setting script to", data);
        const temp: NavHeader[] = [];
        data.forEach(({ id, sectionName }) => {
          temp.push({
            title: sectionName,
            href: `/presentation/${id}`, // same as the one in App.tsx
          });
          setSections(temp);
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
              <div className="flex-1 space-y-10 lg:max-w-2xl">
                <Outlet context={{ script }} />
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
  // const { id } = useOutletContext();
  const id = useParams();

  // gotten form parent element
  const { script } = useOutletContext();

  console.log("full script", script);

  console.log("id of the section", id);
  const section: ScriptData = script.find(
    (data: ScriptData) => data.id === id.sectionId
  );

  console.log("given Section", section);

  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight">
        {section.sectionName}
      </h3>
      <p> {section.scriptTexts[section.selectedScriptIndex]}</p>
    </div>
  );
};
