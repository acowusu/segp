import React from "react";
import { useEffect, useRef } from "react";
import { Timeline } from "./timeline";
import etro from "etro";

export const VideoEditor: React.FC = () => {
  const width = 1920;
  const height = 1080;
  const movieRef = useRef<etro.Movie>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // You can use the canvasRef.current to manipulate the canvas, e.g., draw on it
      const canvas = canvasRef.current;
      const movie = new etro.Movie({ canvas });
      movieRef.current = movie;
      // Example: Draw the movie title on the canvas
    }
  }, [canvasRef]);

  return (
    <main>
      <canvas ref={canvasRef} width={width} height={height} />
      {movieRef.current ? (
        <Timeline movie={movieRef.current} />
      ) : (
        <p> error </p>
      )}
    </main>
  );
};
