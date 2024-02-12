import { PathLike } from "node:fs";
import { pool } from "./pool";
import { spawn } from "child_process";
import { ffmpegPath } from "./binUtils";

export async function convertWebmToMp4(inPath: string | PathLike, outPath: string | PathLike): Promise<void> {
  console.log(`input: ${inPath}`);
  console.log(`output: ${outPath}`);
  console.log("hello");
  // Promise<void>
  await (pool!.run({input: inPath, output: outPath}, {name: "worker_convertWebmToMp4"}) as Promise<void>)
  return
}