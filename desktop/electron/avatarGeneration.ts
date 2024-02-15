interface Avatar {
    id: string;
    imagePath: string;
}

export async function generateAvatar(avatar: Avatar, audioPath: string): Promise<string> {
    
    const endpoint = 'https://iguana.alexo.uk/avatar/';

    const body = {
        driven_audio: audioPath,
        source_image: avatar.imagePath,
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