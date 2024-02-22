import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Reorder } from "framer-motion";
import ContentEditable from 'react-contenteditable'
import { quantum } from 'ldrs'
import {
  FramelessCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScriptData } from "../../electron/mockData/data";
import { PlusIcon} from '@radix-ui/react-icons'


const LoadingScripts = () => {
  quantum.register()


  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-2xl font-bold p-4">Please wait while we generate your scripts</h1>
      <l-quantum
        size="100"
        speed="3" 
        color="red" 
      ></l-quantum>
    </div>
  ) 
}


export const ScriptEditor: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ScriptData[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptData>({} as ScriptData);
  const [showOtherDrafts, setShowOtherDrafts] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true)

  useEffect(() => {
    window.api.getScript().then((data) => {
      setItems(data);
    }).finally(() => {setLoadingScripts(false)});
  }, []);
  const handleShowDrafts = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    console.log
    setShowOtherDrafts(!showOtherDrafts);
  };
  const updateScriptSelection = (e: React.MouseEvent, item: ScriptData, index: number) => {

    e.stopPropagation();
    setItems(items.map((script) => {
      if(script.id === item.id){
        script.selectedScriptIndex = index;
      }
      return script;
    }))
  }
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
    // navigate("/welcome/set-audience");
    await window.api.setScript(items);
    // START PIPELINE

  };
  const selectTopic = async () => {
    navigate("/welcome/set-topic");
  };
  const updateScriptText = (e: React.FormEvent, index: number, id: string) => {
    const target = e.target as HTMLInputElement;
    setItems(items.map((script) => {
      if(script.id === id){
        script.scriptTexts[index] = target.value;
      }
      return script;
    }))
  }
  return (
    <div className="flex items-center justify-center mt-4">
      {loadingScripts ? <LoadingScripts /> : 
      <FramelessCard>
        <CardHeader>
          <CardTitle>Script Editor</CardTitle>
        </CardHeader>
        <CardContent className="h-4/6">
            <div className="flex flex-col gap-2 p-4 pt-0">
              <Reorder.Group axis="y" values={items} onReorder={setItems}>
                {items.map((item) => (
                  <Reorder.Item key={item.id} value={item} className="mb-4">
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all border-2",
                        selectedScript.id === item.id &&
                          " border-2 border-sky-500",
                        selectedScript.id !== item.id &&
                          "hover:border-sky-500 hover: hover:border-dashed"
                      )}
                      onClick={() => handleSetSelectedScript(item)}
                    >
                      <div
                        className={cn(
                          "ml-auto text-xs",
                          selectedScript.id === item.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {/* View Other Drafts */}
                        {selectedScript.id === item.id ? (                        
                        <Badge variant={showOtherDrafts && selectedScript.id === item.id  ? "cloud":"secondary"} onClick={handleShowDrafts}>View Other Drafts</Badge>
                        ) : null}
                      </div>
                      {(selectedScript.id === item.id && showOtherDrafts )&& (
                        <div className="grid md:grid-cols-3 gap-4 w-full">
                          {item.scriptTexts.map((script, index) => (
                            <div onClick={(e)=>updateScriptSelection(e,item, index)} className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500">
                              <div>
                                <Badge variant={ index == item.selectedScriptIndex ? "cloud": "secondary"}>Draft {index + 1}</Badge>
                              </div>
                             {script}
                            </div>
                          ))}
                          
                          <div className="p-2 overflow-hidden border h-20 rounded-lg  hover:border-dashed hover:border-sky-500">
                            <PlusIcon className="w-8 h-8 text-secondary hover:text-sky-500 m-auto" />
                           <p className="text-center">Add new draft</p>
                          </div>
                        </div>
                      )}
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{item.sectionName}</div>
                          </div>
                        </div>
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                      {
                                 selectedScript.id === item.id ?(
                                  <ContentEditable
                                    html={item.scriptTexts[item.selectedScriptIndex]}
                                    disabled={false}
                                    onChange={(e)=>{updateScriptText(e, item.selectedScriptIndex, item.id)}}
                                    className="w-full focus:min-h-20 focus:border rounded-lg focus:p-2 overflow-y-auto	 focus:outline-none"
                                  />
                                 ):(item.scriptTexts[item.selectedScriptIndex])
                              }
                        {}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={selectTopic} variant="outline">Back</Button>
          <Button onClick={setScript}>Next</Button>
        </CardFooter>
      </FramelessCard> }
    </div>
  );
};
