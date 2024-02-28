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
import loadingMessages from "../../electron/mockData/loadingScripts/scriptLoading.json"
import { Progress } from "../components/ui/progress";
import { MediaChoices } from "../components/custom/mediaChoices";



export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScriptData[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptData>(
    {} as ScriptData
  );
  const [aiImageURL, setAiImageURL] = useState("")
  const [showOtherDrafts, setShowOtherDrafts] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [scriptLoadingProgress, setScriptLoadingProgress] = useState(0);
  const [topic, setTopic] = useState<Topic>()
  const [buttonLoading, setButtonLoading] = useState("");
  const [mediaSelected, setMediaSelected] = useState("")

  const loadingImages = ["./analysingpdf.png", "./inspiration.png", "./dict.png" ,"./writing.png"]

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
        {generationProgress <= 100 ? <><div className="w-full mb-4 flex align-center items-center	justify-center flex-col gap-4">
          <img src={loadingImages[(Math.floor(generationProgress / 25)) % 4]} width={500} height={500}/>
          <div className="font-bold text-xl">{loadingMessages[(Math.floor(generationProgress / 5)) % 20]}</div>
        </div>
        <Progress value={generationProgress} className="w-5/6 mt-4" /></> 
        : 
        <Skeleton className="w-4/5 h-3/5 mb-4 flex align-center items-center	justify-center flex-col	">
          <l-quantum size="100" speed="3" color="red"></l-quantum>
          <div className="text-xl font-bold">
            Finalising...
          </div>
        </Skeleton>}
      </div>
    );
  };

  useEffect(() => {
    window.api.getProjectTopic().then(setTopic)
    const TICK = 2000
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
    }, TICK);
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
      const updatedItems = items.map((item) => {
        if (item.id === script.id) {
          item.scriptMedia = imgPath;
          item.scriptPrompt = resolvedPrompt;
        }
        return item;
      }) 
      setItems(
        updatedItems
      );
      setAiImageURL(updatedItems.find((item) => item.id === script.id)?.scriptMedia ?? "")
      await window.api.setScript(updatedItems);
    } else {
      console.log("Media already exists");
    }
  };
  const setMedia = async (script: ScriptData, url: string) => {
    const newItems = items.map((item) => {
      if (script.id === item.id) {
        item.scriptMedia = url;
      }
      return item;
    })
    setItems(newItems)
    await window.api.setScript(newItems)
  }
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
      if (script.imagePrompts) {
        setMediaSelected(script.imagePrompts[0].prompt)
      }
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
                                {buttonLoading === item.id ? "..." : "+"}
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              Generate another version of this section of the script
                            </HoverCardContent>
                          </HoverCard>}
                        </div>
                      </div>
                      <div>
                        {item.scriptMedia ? <img src={`local:///${item.scriptMedia}`} width={200} height={200} /> : 
                        <div className="border rounded-lg p-4">No image</div>}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </CardContent>
          <div className="basis-1/2 h-screen">
          {selectedScript.id !== undefined && 
            <div className="border p-6 flex flex-col gap-4 items-center rounded-xl h-4/5">
                <h1 className="text-4xl font-bold">
                  Customise your media 
                </h1>
                <h3>
                  Selected: {selectedScript.sectionName}
                </h3>
                <div className="grid grid-cols-4 w-full h-full">
                  <div className="col-span-1 h-full flex flex-col gap-4">
                    <Button onClick={() => setMediaSelected("GenAI")} className="bg-inherit border border-gray-500 border-opacity-40 text-primary">Generate AI image</Button>
                    <MediaChoices prompts={selectedScript.imagePrompts??[]}/>
                  </div>
                  <div className="col-span-3 h-full flex items-center justify-center">
                  {mediaSelected === "GenAI" ? <div className="flex-col grow-0">
                        {
                          <>
                            {aiImageURL !== "" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <img
                                    src={`local:///${selectedScript.scriptMedia}`}
                                    alt="script media"
                                    className="w-full aspect-video object-cover rounded-lg"
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
                                    {selectedScript.scriptPrompt && (
                                      <ContentEditable
                                      html={selectedScript.scriptPrompt}
                                      disabled={false}
                                      onChange={(e) => {
                                        updatePromptText(e, selectedScript.id);
                                      }}
                                      className="w-full min-h-20 border rounded-lg p-2 overflow-y-auto	 focus:outline-none"
                                      />
                                      )}
                                    <Button
                                      onClick={() => genAiImage(selectedScript, true)}
                                      >
                                      <UpdateIcon />
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Skeleton className="aspect-video	   flex align-center items-center	justify-center flex-col relative inset-y-0 right-0 w-48	">
                                <Button onClick={() => {genAiImage(selectedScript, true)}}>
                                  <UpdateIcon />
                                </Button>
                              </Skeleton>
                            )}
                          </>
                        }
                      </div> : 
                      <div className="grid grid-cols-3">
                        {selectedScript.imagePrompts && selectedScript.imagePrompts.find((data) => data.prompt === mediaSelected)?.imageURLS.map((url) => {
                          return (<div className="" onClick={async () => setMedia(selectedScript, url)}>
                            <img src={`local:///${url}`} width={200} height={200}/>
                          </div>)
                      })}
                      </div>}
                  </div>
                  
                </div>
            </div>
            }
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
