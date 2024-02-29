import { downloadFile } from "./reportProcessing";
import { getProjectPath } from "./metadata";
import fs from "fs";

export async function imageToVideo(imagePath: string): Promise<string> { 

    const endpoint = 'https://iguana.alexo.uk/v9/video';

    console.log("Image Path: ", imagePath);
    const form = new FormData();

    // const filePromise = new Promise((resolve, reject) => {
    //     fs.readFile(imagePath, (err, data) => {
    //       if (err) { reject(err); }
    //       resolve(dataurl.convert({ data, mimetype: 'image/png' }));
    //     });
    // });
    // const imageUrl = await filePromise as string;

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    form.append("image_file", imageBlob, "image.png");
    console.log("Form: ", form);

    const { destination } = await downloadFile(endpoint, getProjectPath(), {
        method: 'POST',
        body: form,
    });

    console.log("Destination: ", destination);
    return destination;
}