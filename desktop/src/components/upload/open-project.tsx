import { Button } from "../ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
interface OpenProjectProps {
  setProjectFile?: (path?: string | undefined) => void;
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
  useEffect(() => {
    (async () => {
      try {
        const project = await window.api.getLastProject();
        const projects = await window.api.getRecentProjects();
        setRecentProjects(projects);
        setProjectFile(project);
      } catch (e) {
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
                onClick={() => setProjectFile()}
                placeholder="Select a Directory"
                value={projectFilePath}
                readOnly
                disabled={disableFilePicker}
              />
            </div>
            <div>
              <Label htmlFor="list">Open Recent Projects</Label>
              <ScrollArea className="h-[112px] ">
                {recentProjects.map((project) => (
                  <div key={project}>
                    <div
                      className="bg-secondary rounded-lg p-2 mt-2 overflow-hidden w-full text-left"
                      onClick={() => setProjectFile(project)}
                    >
                      {" "}
                      {project}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between ">
        <Button variant="outline">Cancel</Button>
        <Button disabled={disabledNext} onClick={handleNext}>
          Next
        </Button>
      </CardFooter>
    </>
  );
};
