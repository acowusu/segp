import React, { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton"

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
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
export const SetTopic: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic>({} as Topic);

  
  const setTopic = useCallback(async (topic :Topic) => {
    if (topic !== undefined) {
      setSelectedTopic(topic);
      await window.api.setTopic(topic);
    }
  }, []);
  useEffect( () => {
    const promise = window.api.getTopics()
    toast.promise(promise, {
      loading: "Loading topics...",
      success: () => {
        return `Topics have been loaded.`;
      },
      error: "Error",
    })
    promise.then((data:Topic[]) => {
      setItems(data);
      console.log("Got topics", data);
    }).then(() => window.api.getProjectTopic().then((data) => {
        setTopic(data);
      }).catch((e) => {
        console.log(e);
      }))
  }, [setTopic]);
  const setScript = async () => {
    navigate("/script-editor");
  };
  return (
    <div className="flex items-center justify-center mt-4">
      <FramelessCard >
        <CardHeader>
          <CardTitle>Select Topic</CardTitle>
          <CardDescription>
            These topics were identified in the report provided.
            <br className="mb-4" />
            <Badge variant={"secondary"}  className="mt-2 cursor-pointer"
            onClick={()=>toast.promise(window.api.getTopics(true).then(setItems), {
              loading: `Regenerating topics...`,
              success: `Done`,
              error: (e)=>`Error Regenerating: ${e}` 
            })}>Refresh</Badge>

          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
          <ScrollArea className="h-4/6">
            <div className="flex flex-col gap-2 p-4 pt-0">
              {items.map((item) => (
                <button
                  key={item.topic}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all max-w-[40rem]",
                    selectedTopic.topic === item.topic && "border-2 border-sky-500",
                    selectedTopic.topic !== item.topic &&
                          "hover:border-sky-500 hover: hover:border-dashed border-2"
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
              {items.length === 0 && Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all" />
               ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between ">
          <Button onClick={setScript}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
