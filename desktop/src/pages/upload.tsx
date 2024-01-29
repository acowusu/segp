import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { synchronized } from "../lib/utils";

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [reportFilePath, setReportFilePath] = useState("");
  const [projectFilePath, setProjectFilePath] = useState("");
  const [isExistingProject, setIsExistingProject] = useState(false);
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
  const setProjectFile = () =>
    synchronized(lock, async () => {
      console.log("setProjectFile");
      const path = await window.api.getDirectory();
      setProjectFilePath(path);
    });

  const handleNext = async () => {
    if (disabledNext || projectFilePath == "") return;
    if (isExistingProject) {
      window.api.openProject(projectFilePath);
      toast.success(`Loaded settings for ${projectName}`);
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
    navigate("/welcome/set-topic");
    setDisabledNext(true);
  };
  const handleCancel = () => {
    if (disabledCancel) return;
    navigate("/audiogen");
    setDisabledCancel(false);
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <Tabs defaultValue="new" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger onClick={() => setIsExistingProject(false)} value="new">
            New Project
          </TabsTrigger>
          <TabsTrigger onClick={() => setIsExistingProject(true)} value="open">
            Open Project
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Create a new project by uploading a file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Name of your project"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="file">Project Directory</Label>
                    <Input
                      id="file"
                      onClick={setProjectFile}
                      placeholder="Select a Directory"
                      value={projectFilePath}
                      readOnly
                      disabled={disableFilePicker}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="file">Report PDF</Label>
                    <Input
                      id="file"
                      onClick={setReportFile}
                      placeholder="Select a File"
                      value={reportFilePath}
                      readOnly
                      disabled={disableFilePicker}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button disabled={disabledCancel} onClick={handleCancel}>
                Cancel
              </Button>
              <Button disabled={disabledNext} onClick={handleNext}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="open">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Open project</CardTitle>
              <CardDescription>Open an existing project.</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5 mb-32">
                    <Label htmlFor="file">Project Directory</Label>
                    <Input
                      id="file"
                      onClick={setProjectFile}
                      placeholder="Select a Directory"
                      value={projectFilePath}
                      readOnly
                      disabled={disableFilePicker}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between mt-6">
              <Button variant="outline">Cancel</Button>
              <Button disabled={disabledNext} onClick={handleNext}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
