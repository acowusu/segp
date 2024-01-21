import { extractText, getDocumentProxy , extractImages} from "unpdf";
import { readFile } from "node:fs/promises";

const extractTextFromPDF = async (filePath: string): Promise < string > =>{
  // console.log("# Loading document from disk");
  const buffer = await readFile(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const images = []
  // console.log("# Extracting images 1");
  for (let i = 1; i < totalPages; i++) {
    const pageImages = await extractImages(pdf, i);
    images.push(...pageImages);
  }
  // console.log("# Extracting images");
  // for (const image of images) {
  //   console.log(`# Image ${image.length} bytes`);
  //   const buffer = Buffer.from(image);
  //   const filename = `C:\\Users\\alexa\\tmp\\${Date.now()}-image.png`; // Or any other appropriate extension (e.g., .jpg)
  //   await writeFile(filename, buffer);
  // }
  // console.log(`# PDF has ${totalPages} pages`);
  // console.log("# Text content:");
  // console.log(text);

 return text as string
}

// const extractTextFromPDF = async (filePath: string): Promise<string> => {
//   return filePath
// }
// export type ExtractTextFromPDF = typeof extractTextFromPDF
// export default extractTextFromPDF


import { parentPort } from 'worker_threads'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message',async ({filepath}) => {
  port.postMessage(await extractTextFromPDF(filepath))
})

// export default ({ a, b }: { a: number, b: number }) => {
//   return a + b+11;
// };