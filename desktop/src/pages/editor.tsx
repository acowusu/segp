import React, { useEffect, useState, useRef } from "react";
import { MediaStore } from "../lib/mediaStore";
import { MediaStoreContext } from "../lib";
import etro from "etro";

export const Editor: React.FC = () => {
    const [mediaStore] = useState(new MediaStore())
    return (
        <MediaStoreContext.Provider value={mediaStore}>
            <VideoEditor />
        </MediaStoreContext.Provider>
    );
}

export const VideoEditor: React.FC = () => {
    // const mediaStore = React.useContext(MediaStoreContext);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const movieRef = useRef<etro.Movie | null>();

    useEffect(() => {
        // Use the canvas ref to get the canvas element
        if (!canvasRef.current) return; // If the canvas ref is null, 
        if (!imageRef.current) return; // If the image ref is null,
        const canvas = canvasRef.current;

        // Create a new movie instance
        const movie = new etro.Movie({
        canvas,
        repeat: true,
        background: etro.parseColor("#ccc"),
        });

        // Add a video layer to the movie and play it

        canvas.width = 1920;
        canvas.height = 1080;
        const layer1 = new etro.layer.Visual({
        startTime: 0,
        duration: 1,
        background: etro.parseColor("#f1c40f"),
        });
        const layer2 = new etro.layer.Visual({
        startTime: 1,
        duration: 1,
        background: etro.parseColor("#f39c12"),
        });
        const layer3 = new etro.layer.Image({
        startTime: 0,
        duration: 0.5,
        source: imageRef.current,
        sourceX: 0, // default: 0
        sourceY: 0, // default: 0
        sourceWidth: 19200, // default: null (full width)
        sourceHeight: 10800, // default: null (full height)
        x: 0, // default: 0
        y: 0, // default: 0
        width: 1920, // default: null (full width)
        height: 1080, // default: null (full height)
        opacity: 0.8 , // default: 1
        });
        const layer4 = new etro.layer.Image({
        startTime: 0.5,
        duration: 1,
        source: imageRef.current,
        sourceX: 0, // default: 0
        sourceY: 0, // default: 0
        sourceWidth: 19200, // default: null (full width)
        sourceHeight: 10800, // default: null (full height)
        x: 1000, // default: 0
        y: 600, // default: 0
        width: 1920, // default: null (full width)
        height: 1080, // default: null (full height)
        opacity: 0.8 , // default: 1
        });
        movie.addLayer(layer1);
        movie.addLayer(layer2);
        movie.addLayer(layer3);
        movie.addLayer(layer4);

        movie.play();
        movieRef.current = movie;
    }, []);

    return ( 
      <>
        <img  className="hidden" src="/person.png" alt="" ref={imageRef} />
        <canvas className="w-full" ref={canvasRef} />
      </>
    );
};
