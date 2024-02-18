import { PathLike } from "node:fs";
import fs from "node:fs";
import { pool } from "./pool";
// import { spawn } from "child_process";
// import { ffmpegPath } from "./binUtils";

export async function convertWebmToMp4(inPath: string | PathLike, outPath: string | PathLike): Promise<void> {
  console.log(`input: ${inPath}`);
  console.log(`output: ${outPath}`);
  console.log("calling pool run");
  // Promise<void>
  await (pool!.run({input: inPath, output: outPath}, {name: "convertWebmToMp4"}) as Promise<void>)
  return
}

export async function writeBlob(buff: ArrayBuffer, outFile: PathLike ): Promise<void> {
  console.log("started downlaod")
  fs.writeFileSync(`./public/${outFile}`, new Uint8Array(buff));
  console.log("finsihed downlaod")
  
}