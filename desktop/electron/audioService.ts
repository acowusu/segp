import { getProjectPath } from "./metadata";
import { BackingTrack, ScriptData } from "./mockData/data";
import { downloadFile } from "./reportProcessing";

// Takes in an array of strings and returns an array of AudioInfo
export async function textToAudio(script: ScriptData): Promise<ScriptData> {
    console.log("textToAudio", script.scriptTexts);
    console.log("textToAudio", script.selectedScriptIndex);

    const { destination, headers } = await downloadFile('https://iguana.alexo.uk/v0/generate_audio', getProjectPath(), {
        method: 'POST',
        body: JSON.stringify({ script: script.scriptTexts[script.selectedScriptIndex] }),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const duration = parseFloat(headers.get("audio-duration")!);
    // Used with sadtalker
    const location = headers.get("media-location")!;
    script.sadTalkerPath = location;
    script.scriptAudio = destination;
    script.scriptDuration = duration;

    return script

}

export async function generateBackingTrack(prompt: string, duration: number): Promise<BackingTrack> {

    const { destination } = await downloadFile('https://iguana.alexo.uk/v6/generate_audio', getProjectPath(), {
        method: 'POST',
        body: JSON.stringify({ script: prompt, duration: duration }),
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return { audioSrc: destination, audioDuration: duration }

}