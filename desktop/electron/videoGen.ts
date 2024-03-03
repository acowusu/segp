import { downloadFile } from "./reportProcessing";
import { getProjectPath } from "./metadata";
import { readFile } from "node:fs/promises";

export async function imageToVideo(imagePath: string, fps: number=7, videoLength: number=10): Promise<string> { 

    const endpoint = 'https://iguana.alexo.uk/v9/video';

    console.log("Image Path: ", imagePath);
    const form = new FormData();


    const imageBuffer = await readFile(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    form.append("image_file", imageBlob, "image.png");
    form.append("fps", fps.toString());
    form.append("video_length", videoLength.toString());
    console.log("Form: ", form);

    const { destination } = await downloadFile(endpoint, getProjectPath(), {
        method: 'POST',
        body: form,
    });

    console.log("Destination: ", destination);
    return destination;
}