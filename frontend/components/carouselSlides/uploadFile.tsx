'use client'
import React, { useState } from 'react';
import axios from "axios"
import { topicsProp } from '../carousel';

interface UploadProps {
  nextSlide: () => void;
  setTopics: (topics: topicsProp) => void;
}

const UploadFile: React.FC<UploadProps> = ({nextSlide, setTopics}) => {

  const [loading, setLoading] = useState(false);

  async function submitPDFs(content: string) {
    setLoading(true)
      // simulate script being generated
      

    try {
      const response = await axios.post("/api/analyse_script", {data: content});
      // await new Promise(res => setTimeout(res, 1000));
      if (response.status == 200) {
        setTopics(response.data.topics) // get from response
        setLoading(false)
        nextSlide()
      } else {
        console.log("ERROR ERROR ERROR TODO TODO TODO")
      }

    } catch {
      console.log("ERROR ERROR ERROR")
    }
  }
  
  return (
    <div className='h-full w-full flex items-center justify-center p-4 border rounded-xl shadow-lg shadow-white bg-black text-white'>
      <div className=' w-full h-full flex flex-col items-center gap-8'>
        <h1 className='font-bold text-4xl m-8'>
          Upload PDF to turn into a video
        </h1>
            
        <button className='border p-5'>
          Upload
        </button>

        <div className='border w-4/5 overflow-auto no-scrollbar h-2/5'>
          <p>
            Uploaded files:
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
          <p>
            file1
          </p>
        </div>

        <button onClick={() => submitPDFs("content")} disabled={loading} className='border p-5 disabled:bg-gray-800'>{loading ? "Processing..." : "Continue"}</button>
      </div>
    </div>
  );
};

export default UploadFile;