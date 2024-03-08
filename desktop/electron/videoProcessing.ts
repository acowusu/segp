import { PathLike } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { getProjectPath} from "./metadata";
import { pool } from "./pool";
import path from "path";

export async function convertWebmToMp4(
  inPath: string | PathLike,
  outPath: string | PathLike
): Promise<void> {
  console.log(`input: ${inPath}`);
  console.log(`output: ${outPath}`);
  console.log("calling pool run");
  // Promise<void>
  await (pool!.run(
    { webm: inPath, mp4: outPath },
    { name: "convertWebmToMp4" }
  ) as Promise<void>);
  return;
}

export async function writeBlob(outFile: PathLike): Promise<void> {
  console.log("started downlaod");
  const webmFile = `./${outFile}`;
  (await pool!.run(
    { input: webmFile, output: "./public/video.mp4" },
    { name: "convertWebmToMp4" }
  )) as Promise<void>;
  console.log("finsihed downlaod");
}

/**
 * Takes a webm blob buffer and transcodes it into mp4
 * @param buff arraybuffer of the video/webm blob that should be force downlaoded/written
 * @param outFile the name of the video file (will be within the public dir)
 */
export async function webmBLobToMp4(
  buff: ArrayBuffer,
  outFile: PathLike
): Promise<void> {
  console.log("started webm -> mp4");

  // write the contents of the buffer to a webm file
  const webmFile = `public/${outFile}`;
  await writeFile(webmFile, new Uint8Array(buff));

  // transcode to mp4
  return pool!.run(
    { webm: webmFile, mp4: "public/video.mp4" },
    { name: "convertWebmToMp4" }
  ) as Promise<void>;

  console.log("finished webm -> mp4");
}

/**
 * returns the path of the transcoded video 
 * @param vidPath path of the image to video asset (if not downloaded gotta download first)
 */
export async function transcodeImgVidToMp4(vidPath: string): Promise<string> {
  console.log("started transcoding mp4 video");
  const nonce = `vid-${Math.floor(Math.random() * 1000000)}`;
  const out = path.join(getProjectPath(), `${nonce}.mp4`);
  // try {
  await (pool!.run(
    { mp4: vidPath, out: out },
    { name: "transcodeMp4ToH264Encoding" }
    ) as Promise<void>);
  console.log("done transcoding mp4 video");
  return out;
}

export async function prepareMp4Blob(buff: ArrayBuffer): Promise<ArrayBuffer> {
  console.log("started creating the mp4 file");
  const nonce = `temp-${Math.floor(Math.random() * 1000000)}`;
  const webmFile = path.join(getProjectPath(), nonce + ".webm");
  // const mp4File = getOutputPath()
  await writeFile(webmFile, new Uint8Array(buff));
  // // try {
  // await (pool!.run(
  //   { webm: webmFile, mp4: mp4File },
  //   { name: "convertWebmToMp4" }
  // ) as Promise<void>);

  // const data = await readFile(mp4File);
  const data = await readFile(webmFile);


  //delete the temp files
  // fs.unlinkSync(webmFile);
  console.log("deleted webm");
  // fs.unlinkSync(mp4File); // not the best way to delete then redownload find another solution
  // console.log("deleted mp4");

  return data.buffer;
  // }
  // catch (err) {
  //   console.log(`ffmpeg error: ${err}`);
  // }

  // on completion of the ffmpeg transcoding
}
