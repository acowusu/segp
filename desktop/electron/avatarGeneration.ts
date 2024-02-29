import type { Avatar, ScriptData } from './mockData/data';
import { setProjectAvatar } from './projectData';
import avatars from './mockData/avatars.json';
import { downloadFile } from './reportProcessing';
import { getProjectPath } from './metadata';
import fs from "fs";
import dataurl from "dataurl";

export async function generateAvatar(script: ScriptData, avatar: Avatar): Promise<ScriptData> {

    console.log("Generating Avatar with script: ", script);
    console.log("Generating Avatar with avatar: ", avatar);
    const endpoint = 'https://iguana.alexo.uk/v4/avatar/';

    const body = {
        driven_audio: script.sadTalkerPath,
        source_image: avatar.sadtalkerPath,
    }
    console.log("Request body: ", body);

    const { destination } = await downloadFile(endpoint, getProjectPath(), {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        },
    }); 
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(body),
    // });

    script.avatarVideoUrl = destination;
    console.log(script)
    return script;
}

export async function getAvatars(): Promise<Avatar[]> {
    return avatars;
}
  
export async function setAvatar(avatar: Avatar): Promise<void> {
    console.log("setAvatar", avatar);
    setProjectAvatar(avatar);
}

export const toVideoUrl = (filePath:string):Promise<string> => {
    const videoPromise = new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) { reject(err); }
            resolve(dataurl.convert({ data, mimetype: 'video/mp4' }));
            console.log("toVideoUrl", dataurl.convert({ data, mimetype: 'video/mp4' }));
        });
    });
    return videoPromise as Promise<string>;
}