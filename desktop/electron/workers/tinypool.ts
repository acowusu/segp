import fs from "fs";
import { mkdir, readFile } from "node:fs/promises";
import { sep } from "path";
import { PNG } from "pngjs";
import { getDocumentProxy, getResolvedPDFJS } from "unpdf";
import { spawn  } from "node:child_process";
import { ffmpegPath } from "../binUtils";

export const add =  ({ a, b }: { a: number, b: number }) => {
    return a + b
}
export const multiply =  ({ a, b }: { a: number, b: number }) => {
    return a * b
}

// import { worker_convertWebmToMp4 } from "./worker";

export interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export const convertWebmToMp4 = async ({
  webm,
  mp4,
}: {
  webm: string;
  mp4: string;
}): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    console.log(`webm path: ${webm}`);
    console.log(`mp4 path: ${mp4}`);

    console.log(`spawning worker`);
    // -y to auto overwrite the existing file

    // TODO: handle ffmpeg errors?

    const ffmpegProcess = spawn(ffmpegPath, ["-i", `${webm}`, "-y", `${mp4}`], {
      stdio: ["pipe", 1, 2],
    });
    
    ffmpegProcess.on("exit", (code, signal) => {
      console.log(`ffmpeg exited with exit code ${code} and signal ${signal}`);
      if (code === 0) {
        console.log(`transcoding done`);
        resolve();
      } else {
        reject(`Child process exited with no 0 exit code: ${code}`)
      }
    });
    ffmpegProcess.on("error", (err) => {
      console.log("Child process exited with error");
      reject(err);
    })
  })
};

export const extractImagesFromPDF = async ({ filePath, pageNumber, projectPath }: { filePath: string, pageNumber: number, projectPath: string }) => {
    console.log("# Loading images");
    try {
      await mkdir(`${projectPath}${sep}assets`);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any).code !== "EEXIST") {
        throw e;
      }
    }
    const buffer = await readFile(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const page = await pdf.getPage(pageNumber);
  
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(
        `Invalid page number. Must be between 1 and ${pdf.numPages}.`
      );
    }
  
    const operatorList = await page.getOperatorList();
    const { OPS } = await getResolvedPDFJS();
  
    const images: ImageData[] = [];
  
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const op = operatorList.fnArray[i];
  
      if (op !== OPS.paintImageXObject) {
        continue;
      }
  
      const imageKey = operatorList.argsArray[i][0];
      const image = await page.objs.get(imageKey);
      const imageFile = new PNG({ width: image.width, height: image.height });
      imageFile.data = image.data;
      // make asset
  
      imageFile
        .pack()
        .pipe(
          fs.createWriteStream(
            `${projectPath}${sep}assets${sep}${Date.now()}.png`
          )
        );
      images.push({
        data: image.data,
        width: image.width,
        height: image.height,
      });
    }
  
    return images;
  };