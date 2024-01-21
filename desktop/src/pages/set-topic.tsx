import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  FramelessCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Topic } from "../../electron/mockData/data";
export const SetTopic: React.FC = () => {
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
          <CardTitle>Select Topic</CardTitle>
          <CardDescription>
            These topics were identified in the report provided.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
          <ScrollArea className="h-4/6">
            <div className="flex flex-col gap-2 p-4 pt-0">
              {items.map((item) => (
                <button
                  key={item.topic}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                    selectedTopic.topic === item.topic && "bg-muted"
                  )}
                  onClick={()=>setTopic(item)}
                >
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
