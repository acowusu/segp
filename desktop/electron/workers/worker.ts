// import { spawn, exec  } from "node:child_process";
// import { PathLike } from "node:fs";
// import { ffmpegPath } from "../binUtils";
// import {} from "node:worker_threads"
// import { pool } from "../pool";
// import Tinypool from "tinypool";

// TO BE FIXED currently not linked to the handlers, handler must be in tinypool.ts 
// export const worker_convertWebmToMp4 = async ({input, output}: {input: string | PathLike, output: string | PathLike}): Promise<void> => {
//   console.log(`input in worker:${input}`);
//   console.log(`output in worker: ${output}`);

//   ////kills the system, app is undefined?
//   // spawn(ffmpegPath, ["-version"], {stdio: ["pipe", 1, 2]});

//   //// This seems to launch the process fine, 
//   ////(im suspecting this might be running ont he main thread, but will fix that later)
//   // spawn("./build/resources/linux/ffmpeg", ["-version"], {stdio: ["pipe", 1, 2]});
//   // console.log("worker: done");
//   return;
// }