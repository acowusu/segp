import { Button } from "../ui/button";
import {  CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
interface OpenProjectProps {
    setProjectFile?: (path?:string|undefined) => void;
    projectFilePath?: string;
    disableFilePicker?: boolean;
    disabledNext?: boolean;
    handleNext?: () => void;
}

export const OpenProject: React.FC<OpenProjectProps> = ({
    setProjectFile = () => {},
    projectFilePath = "/path/to/dir",
    disableFilePicker = false,
    disabledNext = false,
    handleNext = () => {},
    
}) => {
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  useEffect( () => {
    (async () => {
      try {
        const project= await window.api.getLastProject();
      setRecentProjects([project]);
      }
      catch (e) {
        console.log("Error getting last project", e);
      }
    })();
  }, []);
    return (
      <>
        <CardHeader>
          <CardTitle>Open project</CardTitle>
          <CardDescription>Open an existing project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 ">
              <div className="flex flex-col space-y-1.5 ">
                <Label htmlFor="file">Project Directory</Label>
                <Input
                  id="file"
                  onClick={()=>setProjectFile()}
                  placeholder="Select a Directory"
                  value={projectFilePath}
                  readOnly
                  disabled={disableFilePicker}
                />
              </div>
              <div>
              <Label htmlFor="list">Open Recent Projects</Label>
              {recentProjects.map((project) => (
                <div key={project}>
                  <Button type="button" className="w-full text-left" variant={"secondary"}  onClick={() => setProjectFile(project)}>{project}</Button>
                </div>
              ))}

              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between relative bottom-[-72px]">
          <Button variant="outline">Cancel</Button>
          <Button disabled={disabledNext} onClick={handleNext}>
            Next
          </Button>
        </CardFooter>
      </>
    );
  };
  