import { spawn, exec  } from "node:child_process";
import { PathLike } from "node:fs";
import { ffmpegPath } from "../binUtils";
import {} from "node:worker_threads"
import { pool } from "../pool";
import Tinypool from "tinypool";


export const worker_convertWebmToMp4 = async ({input, output}: {input: string | PathLike, output: string | PathLike}): Promise<void> => {
  console.log(`input in worker:${input}`);
  console.log(`output in worker: ${output}`);
  // const child = spawn(ffmpegPath, ["-version"]);

  spawn(ffmpegPath, ["-version"], {stdio: "pipe"});
  // exec(`/build/resources/linux/ffmpeg -version`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`exec error: ${error}`);
  //     return;
  //   }
  //   console.log(`stdout: ${stdout}`);
  //   console.error(`stderr: ${stderr}`);});

  // const child = spawn("echo", ["1"], {stdio: 'ignore'})
  // .on('error', function(error) {
  //   console.log("ERROR: DETAILS: " + error);
  // })
  // .on('close', function(code) {
  //   console.log("SUCCESS: CODE: " + code);
  // })
  // .on('exit', function(code) {
  //   console.log("EXIT: CODE: " + code);
  // });
  // console.log(child);
  // console.log("hello")
  // child.stderr.pipe(process.stderr);
  // child.stdout.pipe(process.stdout);

}