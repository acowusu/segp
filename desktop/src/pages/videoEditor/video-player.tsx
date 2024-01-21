import etro from "etro";
import React from "react";
import ReactPlayer from "react-player";

export const VideoPlayer: React.FC = () => {
  // TODO: expect a width and a height to be passed in during initial settings?
  const width = 1920;
  const height = 1080;

  return (
    <div>
      <canvas ref="idk" width={width} height={height}></canvas>
    </div>
  );
};
