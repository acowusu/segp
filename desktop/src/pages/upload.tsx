import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

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
import { useNavigate } from "react-router-dom";

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [filePath, setFilePath] = useState("");
  const [disableFilePicker, setDisableFilePicker] = useState(false);
  const [disabledNext, setDisabledNext] = useState(false);

  const setFile = async () => {
    if (disableFilePicker) return;
    setDisableFilePicker(true);
    const path = await window.electronAPI.openFile();
    console.log(path);
    setFilePath(path);
    setDisableFilePicker(false);
  };

  const handleNext = () => {
    if (disabledNext) return;
    navigate("/welcome/set-topic");
    setDisabledNext(true);
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <Tabs defaultValue="new" className="w-[400px]" >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Project</TabsTrigger>
          <TabsTrigger value="open">Open Project</TabsTrigger>
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
                    <Input id="name" placeholder="Name of your project" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="file">Input File</Label>
                    <Input
                      id="file"
                      onClick={setFile}
                      placeholder="Select a File"
                      value={filePath}
                      readOnly
                      disabled={disableFilePicker}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
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
              <CardDescription>
                Open an existing project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                
                  <div className="flex flex-col space-y-1.5 mb-16">
                    <Label htmlFor="file">Select Project Directory</Label>
                    <Input
                      id="file"
                      onClick={setFile}
                      placeholder="Select a File"
                      value={filePath}
                      readOnly
                      disabled={disableFilePicker}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between mt-3">
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
