import fs from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import {getOutputPath, getProjectPath} from "./metadata";
import { pool } from "./pool";
import path from "path";
import { tmpdir } from "os";

export async function webmDataToMp4File(
  webmBuff: ArrayBuffer,
  outPath: string
): Promise<void> {
  console.log(`output: ${outPath}`);
  console.log("calling pool run");
  // Promise<void>
  const nonce = `temp-${Math.floor(Math.random() * 1000000)}`;
  const webmPath = path.join(tmpdir(), nonce + ".webm");

  await writeFile(webmPath, new Uint8Array(webmBuff));

  const mp4Path = path.join(outPath, "output.mp4")

  await (pool!.run(
    { webm: webmPath, mp4: mp4Path },
    { name: "convertWebmToMp4" }
  )) as Promise<void>;
  fs.unlinkSync(webmPath);
  console.log("deleted webm");
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
