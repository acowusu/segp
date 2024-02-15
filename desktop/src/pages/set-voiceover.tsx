import React, { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { useEffect } from "react";
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
  const [selectedVoiceover, setSelectedVoiceover] = useState<Voiceover>(
    {} as Voiceover
  );

  const navigate = useNavigate();
  const navigateNext = async () => {
    navigate("/welcome/set-visuals");
  };
  const setVoiceover = useCallback(async (voiceover: Voiceover) => {
    console.log(voiceover);
    if (voiceover !== undefined) {
      setSelectedVoiceover(voiceover);
      window.api.setVoiceover(voiceover);
      console.log(voiceover);
    }
  }, []);
  useEffect(() => {
    window.api
      .getVoiceovers()
      .then((data) => {
        setItems(data);
      })
      .then(() =>
        window.api
          .getProjectVoiceover()
          .then((data) => {
            setVoiceover(data);
          })
          .catch((e) => {
            console.log(e);
          })
      );
  }, [setVoiceover]);

  return (
    <div className="flex items-center justify-center mt-4">
      <FramelessCard>
        <CardHeader>
          <CardTitle>Select Select the Voiceover for the video</CardTitle>
          <CardDescription>
            The Voiceover will effect the language complexity and the tone of
            the video.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-4/6">
          <Select>
            <SelectTrigger>
              {/* <SelectValue placeholder="Select an Voiceover" /> */}
              <SelectValue  placeholder="Select an Voiceover"  aria-label={selectedVoiceover.name}>
          {selectedVoiceover.name}
        </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {items.map((item) => (
                  <SelectItem
                    key={item.name}
                    value={item.name}
                    onClick={() => setVoiceover(item)}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedVoiceover.name }
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Back</Button>
          <Button onClick={navigateNext}>Next</Button>
        </CardFooter>
      </FramelessCard>
    </div>
  );
};
