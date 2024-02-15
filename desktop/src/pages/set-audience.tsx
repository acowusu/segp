import React, { useCallback, useState } from "react";
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

 
  const navigate = useNavigate();
  const navigateNext = async () => {
    navigate("/welcome/set-voiceover");
  }
  const setAudience = useCallback(async (audience :Audience) => {
 
    if (audience !== undefined) {
      setSelectedAudience(audience);
      window.api.setAudience(audience);
      // console.log(audience)
    }
 
  }, []);
  useEffect( () => {
    window.api.getAudiences().then((data) => {
      setItems(data);
    }).then(() => window.api.getProjectAudience().then((data) => {
      setAudience(data);
    }).catch((e) => {
      console.log(e);
    }))
  }, [setAudience]);
   
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
      <SelectValue  placeholder=" Select an Audience"  aria-label={selectedAudience.name}>
        {selectedAudience.name }
</SelectValue>
        {/* <SelectValue placeholder={selectedAudience?.name || "Select an Audience"} /> */}
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
          {selectedAudience?.name }
          <Button variant="outline">Back</Button>
          <Button onClick={navigateNext}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
