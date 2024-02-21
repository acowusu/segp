import { SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface CreateProjectProps {
  projectName?: string;
  setProjectName?: (name: SetStateAction<string>) => void;
  setProjectFile?: (path?:string|undefined) => void;
  setReportFile?: (e?: unknown) => void;
  reportFilePath?: string;
  projectFilePath?: string;
  disableFilePicker?: boolean;
  disabledNext?: boolean;
  handleNext?: () => void;
}

/**
 * Renders a component for creating a project by uploading a file.
 *
 * @param {string} projectName - The name of the project.
 * @param {function} setProjectName - A function to set the project name.
 * @param {function} setProjectFile - A function to set the project file.
 * @param {function} setReportFile - A function to set the report file.
 * @param {string} reportFilePath - The path of the report file.
 * @param {string} projectFilePath - The path of the project file.
 * @param {boolean} disableFilePicker - Indicates whether the file picker is disabled.
 * @param {boolean} disabledNext - Indicates whether the "Next" button is disabled.
 * @param {function} handleNext - A function to handle the "Next" button click event.
 * @returns {JSX.Element} The rendered component.
 */
export const CreateProject: React.FC<CreateProjectProps> = ({
  setProjectName = () => {},
  projectName = "[Project Name]",
  setProjectFile = () => {},
  setReportFile = () => {},
  reportFilePath = "/path/to/report",
  projectFilePath = "/path/to/dir",
  disableFilePicker = false,
  disabledNext = false,
  handleNext = () => {},
}) => {
  return (
    <>
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
                onClick={()=>setProjectFile()}
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
        <Button variant="outline">Cancel</Button>
        <Button disabled={disabledNext} onClick={handleNext}>
          Next
        </Button>
      </CardFooter>
    </>
  );
};

