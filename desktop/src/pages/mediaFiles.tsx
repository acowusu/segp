import React, { useEffect, useState } from "react";
import { createClient, Video } from "pexels";
import { TimelineAction } from "@xzdarcy/react-timeline-editor";

const pexelsApiKeys = [
  "6MMWrcLkoVjZ8rtjHHeD2YCw9uR2xy6livsQXIZjFrBqoYQDKhpjlTWW",
  "J4nKc6oJDyKJeRJTlC0x5EiQQDZkTuvAyJ1uXt6gC98IGwDleAYqI0RR",
  "nNKofGGjX3XW9Je67z7AdJkla5dUExm1cmx3hsILW0u7ekRm3WWoH5Us",
];
const unsplashAccessKeys = [
  "rlmP_s20oV0tzBO_AJk8lpZXQJluujDLu_OSDAR-aDA",
  "uojJeEAyDSw-BFUiVGM8H6Nh4xxfaOusbBUHnOLev5Y",
  "F-J-6NjEm7kDdL5kCDyFIzfyFyK3RTS1CMI4qaSE_6k",
  "oj1NBnBmcZkgrrXShFqxDK_C9NyvUZqvvEsJWPIsoVI",
];
const queries = ["AI", "Neural Network", "Connected", "City", "Future"];

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export const Media: React.FC<{
  handleAddToPlayer: (media: Video | string) => void;
  toReplace: TimelineAction | null;
}> = ({ handleAddToPlayer, toReplace }) => {
  const [selectedQuery, setSelectedQuery] = useState<string>(queries[0]);
  const [mediaMap, setMediaMap] = useState<{
    [key: string]: (Video | string)[];
  }>({});
  const [pexelsKeyIndex, setPexelsKeyIndex] = useState<number>(0);
  const [unsplashKeyIndex, setUnsplashKeyIndex] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<Video | string | null>(
    null,
  );

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const pexelsClient = createClient(pexelsApiKeys[pexelsKeyIndex]);
        const mediaData: { [key: string]: string[] } = {};

        for (const query of queries) {
          // Fetch Pexels videos
          const pexelsResponse = await pexelsClient.videos.search({
            query,
            orientation: "landscape",
            per_page: 10,
          });

          // Fetch Unsplash photos
          const unsplashEndpoint = `https://api.unsplash.com/search/photos?per_page=11&query=${query}&client_id=${unsplashAccessKeys[unsplashKeyIndex]}`;
          const unsplashResponse = await fetch(unsplashEndpoint);
          const unsplashData = await unsplashResponse.json();

          const unsplashPhotos = unsplashData.results.map(
            (photo: any) => photo.urls.regular,
          );

          // Combine Pexels videos and Unsplash photos
          mediaData[query] = [/*...pexelsResponse.videos,*/ ...unsplashPhotos];
        }

        setMediaMap(mediaData);
        // Rotate Pexels key
        setPexelsKeyIndex(
          (prevIndex) => (prevIndex + 1) % pexelsApiKeys.length,
        );

        // Rotate Unsplash key
        setUnsplashKeyIndex(
          (prevIndex) => (prevIndex + 1) % unsplashAccessKeys.length,
        );
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };

    fetchMedia();
  }, []);

  const handleQueryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuery(event.target.value);
  };

  const MediaElement: React.FC<{ media: string }> = ({ media }) => {
    return (
      <div className="relative flex h-32 transform flex-col items-center justify-between rounded-lg border border-black p-2 transition duration-700 ease-in-out hover:scale-105">
        {typeof media === "string" ? (
          <img
            src={media}
            alt="Unsplash Photo"
            className="mb-2 h-full w-full object-cover object-center"
            style={{ maxHeight: "100%", maxWidth: "100%" }}
          />
        ) : (
          <video
            width="100%"
            height="auto"
            controls
            style={{
              display: "block",
              margin: "0 auto",
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            <source src={media.video_files[0].link} type="video/mp4" />
          </video>
        )}
        {/* <div onClick={() => handleAddToPlayer(media)} className='bg-green-400 border rounded w-8 h-8 flex items-center justify-center absolute right-4 bottom-4 cursor-pointer'>
          +
        </div> */}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col  ">
      <h1 className="p-2 text-2xl font-bold "> Media Files</h1>
      <Separator className="-mt-2 mb-5 h-[2px]" />
      <div className="no-scrollbar pb-1 pl-5 pr-5">
        <Select onValueChange={setSelectedQuery}>
          <SelectTrigger>
            <SelectValue placeholder="Select a Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {queries.map((query) => (
                <SelectItem
                  key={query}
                  value={query}
                  // onClick={() => setSelectedQuery(query)} not sure why this didn't work
                >
                  {query}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="no-scrollbar grid grid-cols-3 gap-4 overflow-auto p-2 pl-5 pr-5 pt-5">
        {mediaMap[selectedQuery]?.map((item, index) => (
          <MediaElement key={index} media={item} />
        ))}
      </div>
    </div>
  );
};

{
  /* <label htmlFor="querySelector">Select a category: </label>
        <select
          id="querySelector"
          value={selectedQuery}
          onChange={handleQueryChange}
          style={{ color: "black" }}
        >
          {queries.map((query) => (
            <option key={query} value={query}>
              {query}
            </option>
          ))}
        </select> */
}
