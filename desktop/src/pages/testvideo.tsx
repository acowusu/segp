import React, { useState } from "react";
import video from "../../public/video.mp4";
import { Button } from "../components/ui/button";
export const TestVideo: React.FC = () => {
  const [video, setVideo] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    // i tested with the test vid in public, this should accept any path
    window.api.transcodeImgVidToMp4("./public/testvid.mp4").then((vid) => {
      // as it loads from the project path, local must be apended
      // you can change how this works from videoProcessing.ts and tinypool.ts
      setVideo("local:///" + vid);
      setLoaded(true);
    });
  };
  return (
    <div>
      <h1> Video</h1>
      <Button onClick={load}> Load </Button>
      {loaded && (
        <video width="800" height="400" controls>
          <source src={video} type="video/mp4" />
        </video>
      )}
    </div>
  );
};
