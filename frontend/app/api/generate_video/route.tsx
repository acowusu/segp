import { createVideo } from '@/createVideo';
import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from "ffmpeg"
import { testFFM } from "../../../index"

export async function POST(req: NextRequest) {

  const pdfBody = await req.json()
  const data = pdfBody.data
  console.log(data)

  // createVideo()
  testFFM()
  
  return NextResponse.json({scripts: "", status: 200});
  // return NextResponse.json({data: [], status: 200});
}
