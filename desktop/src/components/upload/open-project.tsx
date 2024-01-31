import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface OpenProjectProps {
    setProjectFile?: (e?: unknown) => void;
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
    return (
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
    );
  };
  