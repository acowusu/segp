import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
export const Home: React.FC = () => {

  const [filePath, setFilePath] = useState("");
  const [disabled, setDisabled] = useState(false);

  const setFile = async () => {
    if (disabled) return;
    setDisabled(true);
    const path = await window.electronAPI.openFile()
    console.log(path)
    setFilePath(path);
    setDisabled(false);
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
      <CardTitle>Create project</CardTitle>
      <CardDescription>Deploy your new project in one-click.</CardDescription>
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
              <Input id="file" onClick={setFile}  placeholder="Select a File" value={ filePath} readOnly disabled={disabled} />
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline">Cancel</Button>
      <Button>Next</Button>
    </CardFooter>
      </Card>
    </div>
    
      
    
  );
};


