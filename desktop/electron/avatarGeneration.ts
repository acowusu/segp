import type { Avatar } from './mockData/data';
import { setProjectAvatar } from './projectData';
import avatars from './mockData/avatars.json';

export async function generateAvatar(avatar: Avatar, audioPath: string): Promise<string> {

    const endpoint = 'https://iguana.alexo.uk/v4/avatar/';

    const body = {
        driven_audio: audioPath,
        source_image: avatar.sadtalkerPath,
    }
   
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
    return avatarData.data_url;
}

export async function getAvatars(): Promise<Avatar[]> {
    return avatars;
}
  
export async function setAvatar(avatar: Avatar): Promise<void> {
    console.log("setAvatar", avatar);
    setProjectAvatar(avatar);
}