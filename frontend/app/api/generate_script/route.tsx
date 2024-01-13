import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  // Call gpt with the data

  const pdfBody = await req.json()
  const data = pdfBody.data
  console.log(data)
  
  
  return NextResponse.json({scripts: scriptData, status: 200});
  // return NextResponse.json({data: [], status: 200});
}


const scriptData = [{}]