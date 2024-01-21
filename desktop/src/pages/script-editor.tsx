import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import {
  FramelessCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Topic } from "../../electron/mockData/data";
export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic>({} as Topic);
  const [disabled, setDisabled] = useState(false);
  useEffect( () => {
    window.api.getTopics().then((data) => {
      setItems(data);
    });
  }, []);
 
  
  const setTopic = async (topic :Topic) => {
    if (disabled) return;
    setDisabled(true);
    if (topic !== undefined) {
      setSelectedTopic(topic);
      await window.api.setTopic(topic);
    }
    setDisabled(false);
  };
  const setAudience = async () => {
    navigate("/welcome/set-audience");
  };
  return (
    <div className="flex items-center justify-center mt-4">
      <FramelessCard >
        <CardHeader>
          <CardTitle>Script Editor</CardTitle>
          
        </CardHeader>
        <CardContent className="h-4/6">
          <ScrollArea className="h-4/6">
            <div className="flex flex-col gap-2 p-4 pt-0">
              {items.map((item) => (
                <button
                  key={item.topic}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all border-2",
                    selectedTopic.topic === item.topic && " border-2 border-sky-500",
                    selectedTopic.topic !== item.topic && "hover:border-sky-500 hover: hover:border-dashed"
                  )}
                  onClick={()=>setTopic(item)}
                >
                    <div
                  className={cn(
                    "ml-auto text-xs",
                    selectedTopic.topic === item.topic
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                    {/* View Other Drafts */}
                    <Badge  variant={"secondary"}>
                    View Other Drafts
                  </Badge>
                </div>
                  {selectedTopic.topic === item.topic && (
                   <div className="grid md:grid-cols-3 gap-4 w-full">
                   <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"cloud"}>Draft 1</Badge></div> { item.summary}</div>
                   <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"secondary"}>Draft 2</Badge></div> sunt in culpa qui officia deserunt mollit anim id est laborum</div>
                   <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"><div><Badge variant={"secondary"}>Draft 3</Badge></div>  consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</div>
                 </div>)}
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{item.topic}</div>
                      </div>
                    </div>
                    {/* <div className="text-xs font-medium">{item.subject}</div> */}
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {item.summary}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Back</Button>
          <Button onClick={setAudience}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
