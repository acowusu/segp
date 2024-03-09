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
import { UpdateIcon, Cross2Icon, PlusIcon, ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
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
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";

export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScriptData[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptData>(
    {} as ScriptData
  );
  const [disabled, setDisabled] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [loadingSound, setLoadingSound] = useState(false);
  const [scriptLoadingProgress, setScriptLoadingProgress] = useState(0);
  const [topic, setTopic] = useState<Topic>()
  const [buttonLoading, setButtonLoading] = useState("");
  const [mediaSelected, setMediaSelected] = useState("")
  const [hasSoundEffects, setHasSoundEffects] = useState(false)

  const loadingImages = ["./reading_loading.png", "./extracting_loading.png", "./understanding_loading.png", 
                        "./consulting_loading.png", "./creating_loading.png", "./generating_loading.png", "./fetching_loading.png", 
                        "./drinks_loading.png", "./checking_loading.png", "./suggesting_loading.png", "./friend_loading.png", "./final_loading.png", 
                        "./complete_loading.png"]

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
          <img src={loadingImages[(Math.floor(generationProgress / 9)) % 13]} width={500} height={500}/>
          <div className="font-bold text-xl">{loadingMessages[(Math.floor(generationProgress / 9)) % 13]}</div>
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
    window.api.getProjectHasSoundEffect().then(setHasSoundEffects)
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
    let newIndex = items.findIndex((item) => item.id == selectedScript.id) 
    const newItems = items.filter((item) => item.id !== selectedScript.id)
    if (newIndex >= newItems.length) {
      newIndex -= 1
    }
    if (newIndex >= 0) {
      setSelectedScript(newItems[newIndex])
    }
    setItems(newItems);
    await window.api.setScript(newItems);
  };

  const genAIVideo = async (
    script: ScriptData,
    userInitiated?: boolean,
  ) => {
    if (userInitiated && !script.scriptMediaIsVideo) {
      console.log(script.scriptMedia)
      const video = window.api.imageToVideo(script.scriptMedia!.url, 7, 10);
      toast.promise(video, {
        loading: `Generating Video from ${script.scriptMedia} for ${script.sectionName}`,
        success: (video) => `Video Generated: ${video}`,
        error: "Error",
      })
      const videoPath = await video;
      console.log(videoPath)
      const updatedItems = items.map((item) => {
        if (item.id === script.id) {
          item.scriptMedia = {url: videoPath, author: item.scriptMedia!.author};
          item.aiVideos = item.aiVideos ? [...item.aiVideos, videoPath] : [videoPath]
          console.log(item.aiVideos)
          item.scriptMediaIsVideo = true;
        }
        return item;
      }) 
      setItems(
        updatedItems
      );
      await window.api.setScript(updatedItems);
    } else {
      console.log("Media already exists");
    }
  }

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
          item.scriptMedia = {url: imgPath, author: "AI"};
          item.scriptPrompt = resolvedPrompt;
          item.aiImages = item.aiImages ? [...item.aiImages, imgPath] : [imgPath]
        }
        return item;
      }) 
      setItems(
        updatedItems
      );
      await window.api.setScript(updatedItems);
    } else {
      console.log("Media already exists");
    }
  };
  const setMedia = async (script: ScriptData, url: string, isVideo: boolean, author: string) => {
    const newItems = items.map((item) => {
      if (script.id === item.id) {
        item.scriptMedia = {url: url, author: author};
        item.scriptMediaIsVideo = isVideo;
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
        if (script.id === item.id && script.selectedScriptIndex !== index) {
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

    if (script !== undefined) {
      setSelectedScript(script);
      if (script.imagePrompts) {
        setMediaSelected(script.imagePrompts[0].prompt)
      }
    }
    setDisabled(false);
  };
  const setScript = async () => {
    await window.api.setScript(items.map((item) => {return {...item}}));
    navigate("/get-video");
  };
  const selectTopic = async () => {
    navigate("/set-topic");
  };
  const toggleSoundEffect = async (section: ScriptData) => {
    const newItems = items.map((script) => {
      if (script.id === section.id) {
        script.soundEffectPrompt = section.soundEffectPrompt === "No effect" ? "Autogeneffect" : "No effect";
      }
      return script;
    })
    setItems(newItems);
    setSelectedScript(items.find((script) => script.id === selectedScript.id)!)
    await window.api.setScript(newItems);
  }
  const toggleAutoSoundEffect = async (section: ScriptData) => {
    const newItems = items.map((script) => {
      if (script.id === section.id) {
        script.soundEffectPrompt = section.soundEffectPrompt === "Autogeneffect" ? "" : "Autogeneffect";
      }
      return script;
    })
    setItems(newItems);
    setSelectedScript(newItems.find((script) => script.id === selectedScript.id)!)
    await window.api.setScript(newItems);
  }

  const setEffectPrompt = async (section: ScriptData, e: React.ChangeEvent<HTMLInputElement>) => {
    const newItems = items.map((script) => {
      if (script.id === section.id) {
        script.soundEffectPrompt = e.target.value;
      }
      return script;
    })
    setItems(newItems);
    setSelectedScript(newItems.find((script) => script.id === selectedScript.id)!)
    await window.api.setScript(newItems);
  }
  const loadSound = async (section: ScriptData) => {
    setLoadingSound(true)
    const modified = await window.api.generateSoundEffect(section);
    const newItems = items.map((script) => {
      if (script.id === section.id) {
        script = modified;
      }
      return script;
    })
    setItems(newItems);
    setSelectedScript(newItems.find((script) => script.id === selectedScript.id)!)
    await window.api.setScript(newItems);
    setLoadingSound(false)
  }

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
          script.avatarVideoUrl = undefined;
          script.scriptAudio = undefined;
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
        script.avatarVideoUrl = undefined;
        script.scriptAudio = undefined;
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
    <div className="items-center justify-center">
      {loadingScripts ? (
        <LoadingScripts generationProgress={scriptLoadingProgress} />
      ) : (
        <FramelessCard>
          <CardHeader>
            <CardTitle className="text-4xl">Script Editor</CardTitle>
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
          <div className="flex my-4">
          <CardContent className="h-4/6 w-1/2">
            <div className="flex flex-col gap-2 pt-0  ">
              <Reorder.Group axis="y" values={items} onReorder={setItems}>
                {items.map((item) => (
                  <Reorder.Item key={item.id} value={item} className="mb-4"  data-testid="script-section">
                    <div className="flex flex-row gap-2 max-h-[10rem] ">
                      <div
                        key={item.id}
                        data-testid="script-section-clickable"
                        className={cn(
                          "script-section-clickable flex w-full flex-col items-start gap-2 rounded-lg p-4 text-left text-sm transition-all border-2",
                          selectedScript.id === item.id &&
                          " border-2 border-sky-500",
                          selectedScript.id !== item.id &&
                          "hover:border-sky-500 hover: hover:border-dashed"
                          )}
                          onClick={() => handleSetSelectedScript(item)}
                          >
                        <div className="flex flex-row justify-between w-full">
                          
                          <div className="font-semibold">
                            {item.sectionName}
                          </div>

                          <div
                              data-testid="delete-script"
                              onClick={handleDeleteCurrent}
                            className={cn(
                              " text-xs",
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
                                >
                              <Cross2Icon />
                            </Badge>
                          </div>
                            
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground flex flex-row">
                          <button 
                          onClick={() => updateScriptSelection(item, item.selectedScriptIndex - 1)}
                          disabled = {item.selectedScriptIndex === 0}
                          className="border rounded-l-lg p-2 font-bold flex items-center justify-center">
                            <ArrowLeftIcon />
                          </button>
                          {selectedScript.id === item.id ? (
                            <div className="mx-4 p-2 overflow-auto no-scrollbar">
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
                            data-testid="add-draft"
                            onClick={() => updateScriptSelection(item, item.selectedScriptIndex + 1)}
                            className="border rounded-r-lg p-2 font-bold flex items-center justify-center"><ArrowRightIcon /></button> : 
                            
                              <button 
                              disabled = {buttonLoading !== ""}
                              className="border rounded-r-lg flex items-center justify-center"
                              onClick={async () => updateScriptDraftSelection(item, item.selectedScriptIndex + 1)}
                              >
                                <HoverCard openDelay={200}>
                                <HoverCardTrigger>
                                    <div className="h-full w-full font-bold p-2 text-lg" >
                                      {buttonLoading === item.id ? "..." : <PlusIcon />}
                                    </div>
                                    </HoverCardTrigger>
                                <HoverCardContent>
                                  Generate another version of this section of the script
                                </HoverCardContent>
                              </HoverCard>
                              </button>
                            }
                        </div>
                      </div>
                      <div className="w-[25rem] flex grow-0">
                        {(item.scriptMedia && !item.scriptMediaIsVideo) ? <img src={`${item.scriptMedia.url}`} className="w-full aspect-video object-cover rounded-lg"/> : 
                        item.scriptMedia ? <video muted autoPlay loop className="w-full aspect-video object-cover rounded-lg"> <source src={`${item.scriptMedia.url}`} type="video/mp4"/> </video> :
                        <div className="border p-4 w-full aspect-video object-cover rounded-lg">No image</div>}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </CardContent>
          <div className="h-full fixed w-1/2 right-0">
          {selectedScript.id !== undefined && 
            <div className="border p-6 flex flex-col gap-4 items-center rounded-xl mr-8">
                <h1 className="text-2xl font-bold">
                  Customise your media 
                </h1>
                <h3>
                  Selected: {selectedScript.sectionName}
                </h3>
                <div className="w-full h-full">
                  <div className="flex flex-row gap-4">
                    <Button onClick={() => setMediaSelected("GenAIImage")} className="bg-inherit border border-gray-500 border-opacity-40 text-primary">Generate AI image</Button>
                    <Button onClick={() => setMediaSelected("GenAIVideo")} className="bg-inherit border border-gray-500 border-opacity-40 text-primary">Convert image to AI video</Button>
                    {hasSoundEffects && <Button onClick={() => setMediaSelected("soundEffect")} className="bg-inherit border border-gray-500 border-opacity-40 text-primary">Sound Effect</Button>}
                    <MediaChoices prompts={selectedScript.imagePrompts??[]} callback={setMediaSelected}/>
                  </div>
                  <div className="w-full h-full flex justify-start items-start mt-4 gap-4">
                  {mediaSelected === "GenAIImage" ? <div className="flex-col grow-0 w-full">
                        {
                          <div className="grid grid-cols-3 gap-4 w-full">
                              {selectedScript.aiImages && selectedScript.aiImages.map((image, index) => (
                                <Popover key={index}>
                                <PopoverTrigger asChild>
                                  <img
                                    src={image}
                                    alt="script media"
                                    className={`aspect-video border rounded-lg overflow-hidden cursor-pointer
                          ${selectedScript.scriptMedia?.url === selectedScript.aiImages![index] ? "border-2 border-sky-500" : "hover:border-sky-500 hover: hover:border-dashed border-2"}`}
                                    onClick={() => {setMedia(selectedScript, selectedScript.aiImages![index], false, "AI")}}
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
                              ))}
                              <Skeleton className="aspect-video w-full border flex items-center justify-center	">
                                  <Button className="text-2xl font-bold" onClick={() => {genAiImage(selectedScript, true)}}>
                                    +
                                  </Button>
                              </Skeleton>
                            
                          </div>
                        }
                      </div> : mediaSelected == "GenAIVideo" ? <div className="flex-col grow-0 w-full">
                        {
                          <div className="grid grid-cols-3 gap-4 w-full">
                              {selectedScript.aiVideos && selectedScript.aiVideos.map((video, index) => (
                                <div key={index}>
                                  <video
                                    src={video}
                                    className={`aspect-video border rounded-lg overflow-hidden cursor-pointer
                                    ${selectedScript.scriptMedia?.url === selectedScript.aiVideos![index] ? "border-2 border-sky-500" : "hover:border-sky-500 hover: hover:border-dashed border-2"}`}
                                    onClick={() => {setMedia(selectedScript, selectedScript.aiVideos![index], true, "AI")}}
                                    controls
                                  />
                                </div>
                              ))}
                              <Skeleton className="aspect-video w-full border flex items-center justify-center	">
                                <Button className="text-2xl font-bold" onClick={() => {genAIVideo(selectedScript, true)}}>
                                  +
                                </Button>
                              </Skeleton>
                          </div>
                        }
                      </div> : 
                      mediaSelected === "soundEffect" ? 
                        <div className="py-8 flex flex-col gap-8 w-full">
                        
                        <div className="w-full border border-gray-500 border-opacity-40 flex flex-row justify-between p-4 rounded-lg">
                          <div>
                            Have sound effect for this section
                          </div>
                          <Switch
                            checked={selectedScript.soundEffectPrompt !== "No effect"}
                            onCheckedChange={async () => {await toggleSoundEffect(selectedScript)}}
                            />
                        </div>
                        {selectedScript.soundEffectPrompt !== "No effect" && <div className="w-full border border-gray-500 border-opacity-40 flex flex-row justify-between p-4 rounded-lg">
                          <div>
                            Automatically generate effects
                          </div>
                          <Switch
                            checked={selectedScript.soundEffectPrompt === "Autogeneffect"}
                            onCheckedChange={async () => {await toggleAutoSoundEffect(selectedScript)}}
                            />
                        </div>
                        }
                        {selectedScript.soundEffectPrompt !== "No effect" && selectedScript.soundEffectPrompt !== "Autogeneffect" && 
                        <div className="flex flex-col gap-8 items-center justify-center">
                          <div className="w-full flex flex-row gap-4">
                            <Input className="w-3/5" placeholder="Describe sound effect" value={selectedScript.soundEffectPrompt} onChange={(e) => setEffectPrompt(selectedScript, e)}/>
                            <Button onClick={() => loadSound(selectedScript)}>{loadingSound ? "Generating..." : "Generate Effect"}</Button>
                          </div>
                          {loadingSound ? <div>loading sound...</div> : <audio src={selectedScript.soundEffect ? selectedScript.soundEffect : ""} controls/>}
                        </div>}
                        </div> :
                        <div className="grid grid-cols-3 gap-4">
                        {selectedScript.imagePrompts && selectedScript.imagePrompts.find((data) => data.prompt.toLowerCase() === mediaSelected.toLowerCase())?.unsplashedImages.map(({url, author}, index) => {
                          return (
                            <div key={index} className={`aspect-video border rounded-lg overflow-hidden relative group
                            ${selectedScript.scriptMedia?.url === url ? "border-2 border-sky-500" : "hover:border-sky-500 hover:border-dashed border-2"}
                            `} onClick={async () => setMedia(selectedScript, url, false, author)}>
                              <img src={`${url}`} alt="Unsplash"/>
                              <div className="p-2 bg-black bg-opacity-70 w-full absolute bottom-0 invisible group-hover:visible text-primary font-bold">
                                credit: {author}
                              </div>
                            </div>
                          );
                        })}
                        </div>}
                      
                  </div>
                  
                </div>
            </div>
            }
          </div>
        </div>
        <CardFooter className="flex w-1/2 justify-between">
          <Button onClick={selectTopic} variant="outline">Back</Button>
          <Button onClick={setScript}>Next</Button>
        </CardFooter>
      </FramelessCard> 
      )}
    </div>
  );
};
