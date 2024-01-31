import fs from "fs";
import { mkdir, readFile } from "node:fs/promises";
import { sep } from "path";
import { PNG } from "pngjs";
import { extractText, getDocumentProxy, getResolvedPDFJS } from "unpdf";


export const add =  ({ a, b }: { a: number, b: number }) => {
    return a + b
}
export const multiply =  ({ a, b }: { a: number, b: number }) => {
    return a * b
}



export interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}


export const extractTextFromPDF = async ({
  filePath,projectPath
}: {
  filePath: string;
  projectPath:string
}): Promise<{ text: string; images: ImageData[]; }> => {
    console.log("# Loading document from disk", filePath);
    const buffer = await readFile(filePath);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));

    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const images = [];
    // console.log("# Extracting images 1");
    for (let i = 1; i < totalPages; i++) {
        images.push(...(await extractImagesFromPDF({ filePath, pageNumber:i, projectPath })));
    }
    return {text: text as string, images};
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