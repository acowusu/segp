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
import { ScriptData } from "../../electron/mockData/data";
import { UpdateIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

import { Progress } from "../components/ui/progress";

const LoadingScripts = ({
  generationProgress,
}: {
  generationProgress: number;
}) => {
  quantum.register();

  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-2xl font-bold p-4">
        Please wait while we generate your scripts
      </h1>
      <Skeleton className="aspect-video	 w-full mb-4 flex align-center items-center	justify-center flex-col	">
        <l-quantum size="100" speed="3" color="red"></l-quantum>
        <Progress value={generationProgress} className="w-5/6 mt-4" />
      </Skeleton>
    </div>
  );
};

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
  useEffect(() => {
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
  const handleShowDrafts = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    console.log;
    setShowOtherDrafts(!showOtherDrafts);
  };

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
    e: React.MouseEvent,
    item: ScriptData,
    index: number
  ) => {
    e.stopPropagation();
    setItems(
      items.map((script) => {
        if (script.id === item.id) {
          script.selectedScriptIndex = index;
          script.avatarVideoUrl = undefined;
          script.scriptAudio = undefined;
        }
        return script;
      })
    );
    window.api.setScript(items);
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
    navigate("/get-video");
    await window.api.setScript(items);
    // START PIPELINE

    // put ur stuff here
  };
  const selectTopic = async () => {
    navigate("/set-topic");
  };
  const updateScriptText = async (
    e: React.FormEvent,
    index: number,
    id: string
  ) => {
    const target = e.target as HTMLInputElement;
    setItems(
      items.map((script) => {
        if (script.id === id) {
          script.scriptTexts[index] = target.value;
        }
        return script;
      })
    );
    await window.api.setScript(items);
  };
  const updatePromptText = async (e: React.FormEvent, id: string) => {
    const target = e.target as HTMLInputElement;
    setItems(
      items.map((script) => {
        if (script.id === id) {
          script.scriptPrompt = target.value;
        }
        return script;
      })
    );
    await window.api.setScript(items);
  };
  return (
    <div className="flex items-center justify-center mt-4">
      {loadingScripts ? (
        <LoadingScripts generationProgress={scriptLoadingProgress} />
      ) : (
        <FramelessCard>
          <CardHeader>
            <CardTitle>Script Editor</CardTitle>
            <div>
              <Badge
                aria-label="Refresh Scripts"
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
          <CardContent className="h-4/6">
            <div className="flex flex-col gap-2 p-4 pt-0">
              <Reorder.Group axis="y" values={items} onReorder={setItems}>
                {items.map((item) => (
                  <Reorder.Item key={item.id} value={item} className="mb-4"  data-testid="script-section">
                    <div className="flex flex-row gap-2  ">
                      <div
                        key={item.id}
                        data-testid="script-section-clickable"
                        className={cn(
                          "script-section-clickable flex grow flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all border-2",
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
                            aria-label="Delete Script"
                            data-testid="delete-script"
                            variant={
                              selectedScript.id === item.id
                                ? "destructive"
                                : "secondary"
                            }
                            onClick={handleDeleteCurrent}
                          >
                            <Cross2Icon></Cross2Icon>
                          </Badge>
                          {/* View Other Drafts */}
                          <Badge
                            aria-label="Show Drafts"
                            variant={
                              showOtherDrafts && selectedScript.id === item.id
                                ? "cloud"
                                : "secondary"
                            }
                            onClick={handleShowDrafts}
                          >
                            View Other Drafts
                          </Badge>
                        </div>
                        {selectedScript.id === item.id && showOtherDrafts && (
                          <div className="grid md:grid-cols-3 gap-4 w-full">
                            {item.scriptTexts.map((script, index) => (
                              <div
                                onClick={(e) =>
                                  updateScriptSelection(e, item, index)
                                }
                                className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500"
                              >
                                <div>
                                  <Badge
                                  aria-label="Draft Selection"
                                    variant={
                                      index == item.selectedScriptIndex
                                        ? "cloud"
                                        : "secondary"
                                    }
                                  >
                                    Draft {index + 1}
                                  </Badge>
                                </div>
                                {script}
                              </div>
                            ))}

                            {/* <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500">
                            <PlusIcon className="w-8 h-8 text-secondary hover:text-sky-500 m-auto" />
                           <p className="text-center">Add new draft</p>
                          </div> */}
                          </div>
                        )}
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">
                                {item.sectionName}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {selectedScript.id === item.id ? (
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
                          ) : (
                            item.scriptTexts[item.selectedScriptIndex]
                          )}
                          {}
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
          <CardFooter className="flex justify-between">
            <Button onClick={selectTopic} variant="outline">
              Back
            </Button>
            <Button onClick={setScript}>Next</Button>
          </CardFooter>
        </FramelessCard>
      )}
    </div>
  );
};
