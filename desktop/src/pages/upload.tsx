import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card} from "../components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { synchronized } from "../lib/utils";
import { OpenProject } from "../components/upload/open-project";
import { CreateProject } from "../components/upload/create-project";

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [reportFilePath, setReportFilePath] = useState("");
  const [projectFilePath, setProjectFilePath] = useState("");
  const [isExistingProject, setIsExistingProject] = useState(true);
  const lock = useState(false);
  const [disableFilePicker] = lock;
  const [disabledNext, setDisabledNext] = useState(false);
  const [projectName, setProjectName] = useState("");
  const setReportFile = () =>
    synchronized(lock, async () => {
      console.log("setReportFile");
      const path = await window.api.getFile();
      setReportFilePath(path);
    });
  const setProjectFile = (path?: string | undefined) =>
    synchronized(lock, async () => {
      console.log("setProjectFile");
      if(path === undefined || path === "" || path === null) {
        path = await window.api.getDirectory();
      }
      setProjectFilePath(path);
    });

  const handleNext = async () => {
    console.log("handleNext", projectFilePath, disabledNext, isExistingProject);
    if (disabledNext || projectFilePath == "") return;
    if (isExistingProject) {
      window.api.openProject(projectFilePath);
      toast.success(`Loaded settings for ${await window.api.getProjectName()}`);
    } else {
      if (reportFilePath === "" || projectFilePath === "") return;
      await window.api.createProject(
        projectName,
        projectFilePath,
        reportFilePath
      );
      toast.promise(window.api.loadReport(), {
        loading: "Loading report contents...",
        success: () => {
          return `${reportFilePath} has been loaded.`;
        },
        error: "Error",
      });
    }


    navigate("/set-visuals");
    
    setDisabledNext(true);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Tabs defaultValue="open" className="min-w-[400px] ">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger onClick={() => setIsExistingProject(true)} value="open">
            Open Project
          </TabsTrigger>
          <TabsTrigger onClick={() => setIsExistingProject(false)} value="new">
            New Project
          </TabsTrigger>
        </TabsList>
        <Card className="w-[400px] mt-4 h-[400px]" layout >
          
        <TabsContent value="new" className="h-full">
          <CreateProject
            projectName={projectName}
            setProjectName={setProjectName}
            setProjectFile={setProjectFile}
            setReportFile={setReportFile}
            reportFilePath={reportFilePath}
            projectFilePath={projectFilePath}
            disableFilePicker={disableFilePicker}
            disabledNext={disabledNext}
            handleNext={handleNext}
          />
        </TabsContent>
        <TabsContent value="open" className="h-full">
          <OpenProject
            setProjectFile={setProjectFile}
            projectFilePath={projectFilePath}
            disableFilePicker={disableFilePicker}
            disabledNext={disabledNext}
            handleNext={handleNext}
          />
        </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};
