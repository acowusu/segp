import type { Avatar, ScriptData } from './mockData/data';
import { setProjectAvatar } from './projectData';
import avatars from './mockData/avatars.json';
import { downloadFile } from './reportProcessing';
import { getProjectPath } from './metadata';


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

    script.avatarVideoUrl = destination;
    return script;
}

export async function getAvatars(): Promise<Avatar[]> {
    return avatars;
}
  
export async function setAvatar(avatar: Avatar): Promise<void> {
    console.log("setAvatar", avatar);
    setProjectAvatar(avatar);
}