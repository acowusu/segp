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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Visual } from "../../electron/mockData/data";


export const SetVisuals: React.FC = () => {
  const [items, setItems] = useState<Visual[]>([]);
  const [selectedVisual, setSelectedVisual] = useState<Visual>({} as Visual);
  const [disabled, setDisabled] = useState(false);
  useEffect( () => {
    window.api.getVisuals().then((data) => {
      setItems(data);
    });
  }, []);
 
  const navigate = useNavigate();
  const setVisuals = async () => {
    navigate("/welcome/set-visuals");
  }
  const setVisual = async (Visual :Visual) => {
    if (disabled) return;
    setDisabled(true);
    if (Visual !== undefined) {
      setSelectedVisual(Visual);
      console.log(selectedVisual)
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
          <CardTitle>Select Select the Visual for the video</CardTitle>
          <CardDescription>
            The Visual will effect the language complexity and the tone of the video.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
        <Select>
      <SelectTrigger >
        <SelectValue placeholder="Select an Visual" />
      </SelectTrigger>
      <SelectContent>
              <SelectGroup>
              {items.map((item) => (
                <SelectItem
                  key={item.name}
                  value={item.name}
                  onClick={()=>setVisual(item)}
                >
                  {item.name}
                </SelectItem>
              ))}
         
        </SelectGroup>
      </SelectContent>
          </Select>
          <div className="overflow-hidden rounded-md mt-4 relative  h-80 w-full">
            <img
              src={ "/example.jpg"}
              alt={selectedVisual.name}
              className={cn(
                "h-auto w-auto object-cover transition-all absolute bottom-0 right-0",
                "aspect-[16/9]"
              )}
            />
            <img
              src={ "/person.png"}
              alt={selectedVisual.name}
              width={300}
              height={400}
              className={cn(
                "h-32 w-auto object-cover transition-all  absolute bottom-0 right-0",
                "aspect-[16/9]"
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Back</Button>
          <Button onClick={setVisuals}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
