"use client";
import Toolbar from "@/components/toolbar";
import Image from "next/image";
import ReactSplit, { SplitDirection } from "@devbookhq/splitter";
import MediaFiles from "@/components/mediaFiles";
import Tools from "@/components/tools";
import VideoPlayerWithControls from "@/components/videoPlayer";

let mockupURL: string = "video-mockup.mp4";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen h-full bg-gray-700">
      <Toolbar />
      <div className="flex flex-row w-full h-[30rem]">
        <div className="w-1/10 border border-black p-3">
          <Tools />
        </div>
        <div className="w-2/5">
          <MediaFiles />
        </div>
        <div className="flex flex-grow border border-black">
          <VideoPlayerWithControls videoUrl={mockupURL} />
        </div>
      </div>
      <div className="flex flex-grow">
        hi howdie
        <a href="uploadpdf">swap page</a>
      </div>
      <button onClick={() => console.log("lasdkjadsjkh")}>
        press me to log
      </button>
    </main>
  );
}
