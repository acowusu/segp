import React, { useState } from "react";
import { Button } from "../components/ui/button";
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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Voiceover } from "../../electron/mockData/data";


export const SetVoiceover: React.FC = () => {
  const [items, setItems] = useState<Voiceover[]>([]);
  const [selectedVoiceover, setSelectedVoiceover] = useState<Voiceover>({} as Voiceover);
  const [disabled, setDisabled] = useState(false);
  useEffect( () => {
    window.api.getVoiceovers().then((data) => {
      setItems(data);
    });
  }, []);
 
  const navigate = useNavigate();
  const setVisuals = async () => {
    navigate("/welcome/set-visuals");
  }
  const setVoiceover = async (Voiceover :Voiceover) => {
    if (disabled) return;
    setDisabled(true);
    if (Voiceover !== undefined) {
      setSelectedVoiceover(Voiceover);
      console.log(selectedVoiceover)
    }
    // const path = await window.api.setTopic(items.find((topic) => topic.topic === selectedTopic) as Topic);
    // console.log(path);
    // setFilePath(path);
    setDisabled(false);
  };
   
  return (
    <div className="flex items-center justify-center mt-4">
      <FramelessCard >
        <CardHeader>
          <CardTitle>Select Select the Voiceover for the video</CardTitle>
          <CardDescription>
            The Voiceover will effect the language complexity and the tone of the video.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
        <Select>
      <SelectTrigger >
        <SelectValue placeholder="Select an Voiceover" />
      </SelectTrigger>
      <SelectContent>
              <SelectGroup>
              {items.map((item) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  onClick={()=>setVoiceover(item)}
                >
                  {item.name}
                </SelectItem>
              ))}
         
        </SelectGroup>
      </SelectContent>
    </Select>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Back</Button>
          <Button onClick={setVisuals}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
