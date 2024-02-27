import type { Avatar, ScriptData } from './mockData/data';
import { setProjectAvatar } from './projectData';
import avatars from './mockData/avatars.json';

export async function generateAvatar(script: ScriptData, avatar: Avatar): Promise<ScriptData> {

    console.log("Generating Avatar with script: ", script);
    console.log("Generating Avatar with avatar: ", avatar);
    const endpoint = 'https://iguana.alexo.uk/v4/avatar/';

    const body = {
        driven_audio: script.sadTalkerPath,
        source_image: avatar.sadtalkerPath,
    }
    console.log("Request body: ", body);
    const reponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });

    if (!reponse.ok) {
        throw new Error(`Failed to generate avatar. Status: ${reponse.status} - ${reponse.statusText}`);
    }

    const avatarData = await reponse.json();
    script.avatarVideoUrl = avatarData.data_url;
    return script;
}

export async function getAvatars(): Promise<Avatar[]> {
    return avatars;
}

export async function setAvatar(avatar: Avatar): Promise<void> {
    console.log("setAvatar", avatar);
    setProjectAvatar(avatar);
}
