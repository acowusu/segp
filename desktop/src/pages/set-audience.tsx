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
import { Audience } from "../../electron/mockData/data";


export const SetAudience: React.FC = () => {
  const [items, setItems] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<Audience>({} as Audience);
  const [disabled, setDisabled] = useState(false);
  useEffect( () => {
    window.api.getAudiences().then((data) => {
      setItems(data);
    });
  }, []);
 
  const navigate = useNavigate();
  const setVoiceover = async () => {
    navigate("/welcome/set-voiceover");
  }
  const setAudience = async (audience :Audience) => {
    if (disabled) return;
    setDisabled(true);
    if (audience !== undefined) {
      setSelectedAudience(audience);
      console.log(selectedAudience)
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
          <CardTitle>Select Select the audience for the video</CardTitle>
          <CardDescription>
            The audience will effect the language complexity and the tone of the video.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
        <Select>
      <SelectTrigger >
        <SelectValue placeholder="Select an Audience" />
      </SelectTrigger>
      <SelectContent>
              <SelectGroup>
              {items.map((item) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  onClick={()=>setAudience(item)}
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
          <Button onClick={setVoiceover}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
