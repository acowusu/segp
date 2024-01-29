import fs from "fs";
import { mkdir, readFile } from "node:fs/promises";
import { sep } from "path";
import { PNG } from "pngjs";
import { extractText, getDocumentProxy, getResolvedPDFJS } from "unpdf";
import { parentPort } from "worker_threads";
import { getProjectPath } from "../metadata";
import { createProjectStore } from "../store";
import { Task } from "./task";
interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}
const setupTask = new Task();

interface ProcedureCall {
  rpc: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
const extractTextFromPDF = async ({
  filePath,
}: {
  filePath: string;
}): Promise<string> => {
  await setupTask.done;
  console.log("# Loading document from disk", filePath);
  const buffer = await readFile(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const images = [];
  // console.log("# Extracting images 1");
  for (let i = 1; i < totalPages; i++) {
    images.push(...(await extractImagesFromPDF(filePath, i)));
  }
  return text as string;
};

const extractImagesFromPDF = async (filePath: string, pageNumber: number) => {
  console.log("# Loading images");
  try {
    await mkdir(`${getProjectPath()}${sep}assets`);
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
          `${getProjectPath()}${sep}assets${sep}${Date.now()}.png`
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callableFunctions: { [key: string]: (data: any) => any } = {
  extractTextFromPDF: extractTextFromPDF,
  setup: async ({ path }: { path: string }) => {
    createProjectStore(path);
    console.log("SETUP", path);
    setupTask.finish();
  },
};

const port = parentPort;
if (!port) throw new Error("IllegalState");
port.on("message", async (callData: ProcedureCall) => {
  const { rpc, data } = callData;
  console.log("RPC", rpc);
  console.log("DATA", JSON.stringify(data));
  const result = await callableFunctions[rpc](data);
  port.postMessage({ rpc, result });
});
// port.on("message", async ({ filepath }) => {
//   port.postMessage(await extractTextFromPDF(filepath));
// });

// export default ({ a, b }: { a: number, b: number }) => {
//   return a + b+11;
// };
