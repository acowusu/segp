import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Reorder } from "framer-motion";
import ContentEditable from "react-contenteditable";
import { quantum } from "ldrs";
import {
  FramelessCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScriptData, Topic } from "../../electron/mockData/data";
import { UpdateIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card"

import { Progress } from "../components/ui/progress";



export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScriptData[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptData>(
    {} as ScriptData
  );
  const [showOtherDrafts, setShowOtherDrafts] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [scriptLoadingProgress, setScriptLoadingProgress] = useState(0);
  const [topic, setTopic] = useState<Topic>()
  const [buttonLoading, setButtonLoading] = useState("");

  const LoadingScripts = ({
    generationProgress,
  }: {
    generationProgress: number;
  }) => {
    quantum.register();
  
    return (
      <div className="flex flex-col gap-8 items-center justify-center">
        <h1 className="text-2xl font-bold p-4">
          Please wait while we generate your scripts for {topic?.topic}
        </h1>
        <h1 className="text-xl font-semibold p-4">
          About video:  {topic?.summary}
        </h1>
        <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
          <l-quantum size="100" speed="3" color="red"></l-quantum>
          <Progress value={generationProgress} className="w-5/6 mt-4" />
        </Skeleton>
      </div>
    );
  };

  useEffect(() => {
    window.api.getProjectTopic().then(setTopic)
    const task = window.api
      .getScript()
      .then(setItems)
      .finally(() => {
        setLoadingScripts(false);
      });
    toast.promise(task, {
      loading: `Fetching scripts...`,
      success: `Done`,
      error: (e) => `Error fetching scripts: ${e}`,
    });
    const interval = setInterval(() => {
      setScriptLoadingProgress((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteCurrent = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setItems(items.filter((item) => item.id !== selectedScript.id));
    await window.api.setScript(items);
  };
  const genAiImage = async (
    script: ScriptData,
    userInitiated?: boolean,
    force?: boolean
  ) => {
    if (script.scriptMedia === undefined || userInitiated) {
      const imgPrompt =
        force || !script.scriptPrompt
          ? window.api.generateOpenJourneyPrompt(script)
          : Promise.resolve(script.scriptPrompt);

      toast.promise(imgPrompt, {
        loading: `Generating Image Prompt for ${script.sectionName}`,
        success: (imgPrompt) => `Image Prompt Generated: ${imgPrompt}`,
        error: "Error",
      });
      console.log(await imgPrompt);
      const img = window.api.generateOpenJourneyImage(await imgPrompt);
      toast.promise(img, {
        loading: `Generating Image for ${script.sectionName}`,
        success: (img) => `Image Generated: ${img}`,
        error: "Error",
      });
      const resolvedPrompt = await imgPrompt;
      const imgPath = await img;
      console.log(imgPath);
      setItems(
        items.map((item) => {
          if (item.id === script.id) {
            item.scriptMedia = imgPath;
            item.scriptPrompt = resolvedPrompt;
          }
          return item;
        })
      );
      await window.api.setScript(items);
    } else {
      console.log("Media already exists");
    }
  };
  const updateScriptSelection = (
    item: ScriptData,
    index: number
  ) => {
    setItems(
      items.map((script) => {
        if (script.id === item.id) {
          script.selectedScriptIndex = index;
        }
        return script;
      })
    );
  };
  const handleSetSelectedScript = async (script: ScriptData) => {
    if (disabled) return;
    setDisabled(true);
    if (selectedScript.id !== script.id) setShowOtherDrafts(false);

    if (script !== undefined) {
      setSelectedScript(script);
    }
    setDisabled(false);
  };
  const setScript = async () => {
    await window.api.setScript(items.map((item) => {return {...item, scriptAudio: undefined}}));
    navigate("/get-video");
  };
  const selectTopic = async () => {
    navigate("/set-topic");
  };
  const updateScriptDraftSelection = async (
    item: ScriptData,
    index: number
  ) => {
    //set loading, disable button
    setButtonLoading(item.id)
    window.api.generateNewScript(item.scriptTexts[item.scriptTexts.length - 1])
    .then(async (newScript) => {
      console.log(newScript);
      const newItems = items.map((script) => {
        if (script.id === item.id) {
          script.scriptTexts.push(newScript)
          script.selectedScriptIndex = index;
        }
        return script;
      })
      setItems(newItems)
      await window.api.setScript(newItems);
    })
    .catch((err) => console.log(err))
    .finally(() => setButtonLoading(""))
  };
  const updateScriptText = async (
    e: React.FormEvent,
    index: number,
    id: string
  ) => {
    const target = e.target as HTMLInputElement;
    const newItems = items.map((script) => {
      if (script.id === id) {
        script.scriptTexts[index] = target.value;
      }
      return script;
    })
    setItems(newItems);
    await window.api.setScript(newItems);
  };
  const updatePromptText = async (e: React.FormEvent, id: string) => {
    const target = e.target as HTMLInputElement;
    const newItems = items.map((script) => {
      if (script.id === id) {
        script.scriptPrompt = target.value;
      }
      return script;
    })
    setItems(
      newItems
    );
    await window.api.setScript(items);
  };
  return (
    <div className="items-center justify-center mt-4">
      {loadingScripts ? (
        <LoadingScripts generationProgress={scriptLoadingProgress} />
      ) : (
        <FramelessCard>
          <CardHeader>
            <CardTitle>Script Editor</CardTitle>
            <div>
              <Badge
                variant={"secondary"}
                onClick={() =>
                  toast.promise(window.api.getScript(true).then(setItems), {
                    loading: `Regenerating script...`,
                    success: `Done`,
                    error: (e) => `Error regenerating script: ${e}`,
                  })
                }
              >
                Refresh
              </Badge>
            </div>
          </CardHeader>
          <div className="flex flex-row my-4">
          <CardContent className="h-4/6 basis-1/2 overflow-y-auto">
            <div className="flex flex-col gap-2 p-4 pt-0 ">
              <Reorder.Group axis="y" values={items} onReorder={setItems}>
                {items.map((item) => (
                  <Reorder.Item key={item.id} value={item} className="mb-4">
                    <div className="flex flex-row gap-2 ">
                      <div
                        key={item.id}
                        className={cn(
                          "flex grow flex-col items-start gap-2 rounded-lg p-4 text-left text-sm transition-all border-2",
                          selectedScript.id === item.id &&
                          " border-2 border-sky-500",
                          selectedScript.id !== item.id &&
                          "hover:border-sky-500 hover: hover:border-dashed"
                          )}
                          onClick={() => handleSetSelectedScript(item)}
                          >
                        <div
                          className={cn(
                            " text-xs flex justify-between w-full items-center",
                            selectedScript.id === item.id
                            ? "text-foreground"
                              : "text-muted-foreground"
                              )}
                              >
                          <Badge
                            variant={
                              selectedScript.id === item.id
                              ? "destructive"
                                : "secondary"
                              }
                              onClick={handleDeleteCurrent}
                              >
                            <Cross2Icon></Cross2Icon>
                          </Badge>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">
                                {item.sectionName}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground flex flex-row">
                          <button 
                          onClick={() => updateScriptSelection(item, item.selectedScriptIndex - 1)}
                          disabled = {item.selectedScriptIndex === 0}
                          className="border rounded-l-lg p-2 font-bold flex items-center justify-center">
                            {"<"}
                          </button>
                          {selectedScript.id === item.id ? (
                            <div className="mx-4 p-2">
                              <ContentEditable
                                html={item.scriptTexts[item.selectedScriptIndex]}
                                disabled={false}
                                onChange={(e) => {
                                  updateScriptText(
                                    e,
                                    item.selectedScriptIndex,
                                    item.id
                                    );
                                  }}
                                  className="w-full focus:min-h-20 focus:border rounded-lg focus:p-2 overflow-y-auto	 focus:outline-none"
                                  />
                              </div>
                          ) : (
                            <div className="mx-4 p-2">
                              {item.scriptTexts[item.selectedScriptIndex]}
                            </div>
                          )}
                          
                            {item.selectedScriptIndex !== item.scriptTexts.length - 1 ? 
                            <button 
                            onClick={() => updateScriptSelection(item, item.selectedScriptIndex + 1)}
                            className="border rounded-r-lg p-2 font-bold flex items-center justify-center">{">"}</button> : 
                            <HoverCard openDelay={200}>
                            <HoverCardTrigger>
                              <button 
                              disabled = {buttonLoading !== ""}
                              className="border rounded-r-lg p-2 font-bold flex items-center justify-center text-lg"
                              onClick={async () => updateScriptDraftSelection(item, item.selectedScriptIndex + 1)}
                              >
                                {buttonLoading === item.id ? "loading" : "+"}
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              Generate another version of this section of the script
                            </HoverCardContent>
                          </HoverCard>}
                        </div>
                      </div>
                      <div></div>
                      <div className="flex-col grow-0 max-w-48  min-w-48  w-48 ">
                        {
                          <>
                            {item.scriptMedia !== undefined ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <img
                                    src={`local:///${item.scriptMedia}`}
                                    alt="script media"
                                    className="w-48 aspect-video object-cover rounded-lg"
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="grid gap-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium leading-none">
                                        Modify Image
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        Customize the prompt for this image
                                      </p>
                                    </div>
                                    {item.scriptPrompt && (
                                      <ContentEditable
                                      html={item.scriptPrompt}
                                      disabled={false}
                                      onChange={(e) => {
                                        updatePromptText(e, item.id);
                                      }}
                                      className="w-full min-h-20 border rounded-lg p-2 overflow-y-auto	 focus:outline-none"
                                      />
                                      )}
                                    <Button
                                      onClick={() => genAiImage(item, true)}
                                      >
                                      <UpdateIcon />
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Skeleton className="aspect-video	   flex align-center items-center	justify-center flex-col relative inset-y-0 right-0 w-48	">
                                <Button onClick={() => genAiImage(item, true)}>
                                  <UpdateIcon />
                                </Button>
                              </Skeleton>
                            )}
                          </>
                        }
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </CardContent>
          <div className="basis-1/2 h-screen">
            <div className="border p-6 flex flex-col items-center justify-center rounded-xl h-4/5">
                FIXED CONTENT ON PAGE
            </div>
          </div>
            
        </div>
        <CardFooter className="flex justify-between">
          <Button onClick={selectTopic} variant="outline">Back</Button>
          <Button onClick={setScript}>Next</Button>
        </CardFooter>
      </FramelessCard> 
      )}
    </div>
  );
};
