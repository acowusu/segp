'use client'
import Toolbar from '@/components/toolbar'
import Image from 'next/image'
import ReactSplit, { SplitDirection } from '@devbookhq/splitter'
import MediaFiles from '@/components/mediaFiles'
import Tools from '@/components/tools'
import VideoPlayerWithControls from '@/components/videoPlayer'
import { createVideo } from '@/createVideo'
import axios from 'axios'


export default function Home() {  
  
  async function generateVideo() {

    var finalScript = ""

    try {
      const response = await axios.post("/api/generate_video", {data: finalScript});
      if (response.status == 200) {
        console.log("complete")
      } else {
        console.log("ERROR ERROR ERROR TODO TODO TODO")
      }

    } catch {
      console.log("ERROR ERROR ERROR")
    }
  }


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
          <VideoPlayerWithControls videoUrl={'https://www.youtube.com/watch?v=JL-wFS2E-eM&ab_channel=PDTV'}/>
        </div>
      </div>
      <div className="flex flex-grow">hi howdie
        <a href="uploadpdf">swap page</a>
      </div>
      <button onClick={() => generateVideo()}>press me to log</button>
    </main>
  );
  
}
