import fs from "node:fs";
import { writeFile } from "node:fs/promises";
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
