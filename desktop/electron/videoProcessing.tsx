import { PathLike } from "node:fs";
import fs from "node:fs";
import { pool } from "./pool";
// import { spawn } from "child_process";
// import { ffmpegPath } from "./binUtils";

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
  fs.writeFileSync(webmFile, new Uint8Array(buff));

  // transcode to mp4
  return pool!.run(
    { webm: webmFile, mp4: "public/video.mp4" },
    { name: "convertWebmToMp4" }
  ) as Promise<void>;

  console.log("finished webm -> mp4");
}

export async function prepareMp4Blob(buff: ArrayBuffer): Promise<ArrayBuffer> {
  console.log("started creating the mp4 file");

  const webmFile = "public/video.webm";
  const mp4File = "public/video.mp4";

  fs.writeFileSync(webmFile, new Uint8Array(buff));
  fs.readFile;
  // try {
  await (pool!.run(
    { webm: webmFile, mp4: mp4File },
    { name: "convertWebmToMp4" }
  ) as Promise<void>);

  const data = fs.readFileSync(mp4File);

  //delete the temp files
  fs.unlinkSync(webmFile);
  console.log("deleted webm");
  fs.unlinkSync(mp4File); // not the best way to delete then redownload find another solution
  console.log("deleted mp4");

  return new Promise<ArrayBuffer>((resolve) => {
    resolve(data.buffer as ArrayBuffer);
  });
  // }
  // catch (err) {
  //   console.log(`ffmpeg error: ${err}`);
  // }

  // on completion of the ffmpeg transcoding
}
