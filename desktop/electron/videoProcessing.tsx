import { PathLike } from "node:fs";
import fs from "node:fs";
import { pool } from "./pool";
import { fstat } from "original-fs";
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
export async function writeBlob(blob: Blob, outFile: PathLike ): Promise<void> {
  
  fs.writeFileSync(outFile, new Uint8Array(await blob.arrayBuffer()));
  
  
}