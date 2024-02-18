/**
 * @prettier
 */

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

export async function webmBLobToMp4(
  buff: ArrayBuffer,
  outFile: PathLike
): Promise<void> {
  console.log("started webm -> mp4");

  // write the contents of the buffer to a webm file
  const webmFile = `public/${outFile}`;
  fs.writeFileSync(webmFile, new Uint8Array(buff));

  // transcode to mp4
  (await pool!.run(
    { webm: webmFile, mp4: "public/video.mp4" },
    { name: "convertWebmToMp4" }
  )) as Promise<void>;

  console.log("finished webm -> mp4");
}
