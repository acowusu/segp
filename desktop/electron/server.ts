import { getProjectPath } from "./metadata";
import type { ScriptData, Topic, ImageData } from "./mockData/data";
import { downloadFile, fetchImages } from "./reportProcessing";
import scriptSchema from "./schemas/script.json";
import topicSchema from "./schemas/topic.json";
import imageSchema from "./schemas/image.json";
import newScriptSchema from "./schemas/newScript.json"
import imagePromptsSchema from "./schemas/imagePromps.json"

interface LLMResponse<T> {
    response: {
        topics?: T[];
        sections?: T[];
        prompt?: T;
    }
}

interface LLMTopic {
    title: string;
    subtitle: string;
}

interface LLMSection {
    title: string;
    sentences: LLMSentence[];
}

interface LLMSentence {
    text: string;
}

export async function generateTextFromLLM (
    prompt: string,
    raw: boolean = false
): Promise<string> {

    const params = new URLSearchParams();

    params.append("prompt", raw ? prompt : `[INST] ${prompt} [/INST] `);
    params.append("temperature", "0.7");
    // console.log(systemPrompt, userPromp, temperature);
    const url = "https://iguana.alexo.uk/v3/generate";

    const options = {
        method: "POST",
        // headers: {'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001'},
        body: params,
    };

    try {
        const response = await fetch(url, options);
        const responseText = (await response.json() as LLMResponse<string>).response;

        return responseText as string;
    } catch (err) {
        console.error("error:" + err);
        return "";
    }
};

const TOPICS_SYS = `
Below is some information.
Find me a list of topics from this information which you could create an informative video out of (as well as an overview topic). 
For this video, you can use general knowledge, but you should aim to use only information which is supplied in the information. If there is information which conflicts with your knowledge, assume that the information provided is right:

`


const TOPICS_HEADER = `[INST]
<<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`

const TOPICS_FOOTER = `Format the response as JSON. Ensure that the script has a good nararive flow
Ensure each section has at least 3 sentences`

/**
 * Generates topics based on the provided report.
 * @param report - The report to generate topics from.
 * @returns A promise that resolves to an array of Topic objects.
 * @throws Error if there is an error generating topics.
 */
export async function generateTopics  (report: string): Promise<Topic[]>  {

    const params = new URLSearchParams();
    console.log("generating Topics")
    params.append("prompt",  TOPICS_HEADER + TOPICS_SYS + report + TOPICS_FOOTER);
    params.append("schema", JSON.stringify(topicSchema));
    params.append("max_new_tokens", "200");
    params.append("max_string_token_length", "200");

    params.append("temperature", "0.7");
    const url = "https://iguana.alexo.uk/v3/generate";
    
    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        const response = await fetch(url, options);
        const responseParsed = (await response.json() as LLMResponse<LLMTopic>).response;
        console.log(JSON.stringify(responseParsed))
        return responseParsed.topics!.map((topic) => {
            return {
                topic: topic.title,
                summary: topic.subtitle,
                };
        });
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating topics")
    }
}
const SCRIPT_HEADER = `[INST]
<<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`

const SCRIPT_FOOTER = `Format the response as JSON. Ensure that the script has a good nararive flow
Ensure each section has at least 3 sentences
[/INST]`

/**
 * Generates a script based on the provided report and topic.
 * 
 * @param report - The report containing information for the script.
 * @param topic - The topic for the script.
 * @returns A promise that resolves to an array of ScriptData objects representing the generated script.
 * @throws Error if there is an error generating the script.
 */
export const generateScript = async (report: string, topic:Topic): Promise<ScriptData[]> => {

    const params = new URLSearchParams();
    const SCRIPT_SYS = `
    Below is some information. 
    Create a 2 minute script about ${topic.topic} only using the information below. The script should be split up into as many sections as you deem necessary, where each section is a different part of the video and they should seamlessly connect together. for each section, create me 3 different scripts for that section, so that i can choose my favorite.
    `
    params.append("prompt",  SCRIPT_HEADER + SCRIPT_SYS + report + SCRIPT_FOOTER);
    params.append("schema", JSON.stringify(scriptSchema));
    params.append("temperature", "0.7");
    // console.log(systemPrompt, userPromp, temperature);
    const url = "https://iguana.alexo.uk/v3/generate";
    
    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        const response = await fetch(url, options);
        const responseParsed = (await response.json() as LLMResponse<LLMSection>).response;
        console.log(JSON.stringify(responseParsed))
        const awaitedParsed = responseParsed.sections!.map(async (section:LLMSection) => {
        const sentences = section.sentences.map(async (sentence, i) =>{
            const imgPrompts = await genImagePrompts(sentence.text);
            return {
                id: performance.now().toString(16), 
                imagePrompts: imgPrompts,
                selectedScriptIndex: 0,
                sectionName: section.title + " Part " + (i+1).toString(),
                scriptTexts: [sentence.text],
                scriptMedia: imgPrompts[0].imageURLS[0]
                }
        })
        return await Promise.all(sentences);
        })
        
        return (await Promise.all(awaitedParsed)).flat();
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Script")
    }
}

export const generateExtraScript = async (script: string): Promise<string> => {
    console.log("gening new script")
    const params = new URLSearchParams();

    const SCRIPT_HEADER = `[INST]`
    const SCRIPT_FOOTER = ` Format the response as JSON. [/INST]`

    params.append("prompt",  SCRIPT_HEADER + "Give me one way to reword the following: " + script + SCRIPT_FOOTER);
    params.append("schema", JSON.stringify(newScriptSchema));
    params.append("temperature", "0.7");
    // console.log(systemPrompt, userPromp, temperature);
    const url = "https://iguana.alexo.uk/v3/generate";

    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        const response = await fetch(url, options);
        const responseParsed = (await response.json() as LLMResponse<string>);
        console.log(JSON.stringify(responseParsed.response))
        return responseParsed.response as string;
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Script")
    }
}

export const genImagePrompts = async (script: string): Promise<ImageData[]> => {
    console.log("gening new script")
    const params = new URLSearchParams();

    const SCRIPT_HEADER = `[INST]
    Give me a list of objects which i can get images of which best fits in with this text:
    `
    const SCRIPT_FOOTER = ` Format the response as JSON. [/INST]`

    params.append("prompt",  SCRIPT_HEADER + ": " + script + SCRIPT_FOOTER);
    params.append("schema", JSON.stringify(imagePromptsSchema));
    params.append("temperature", "0.7");
    // console.log(systemPrompt, userPromp, temperature);
    const url = "https://iguana.alexo.uk/v3/generate";

    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        console.log(params)
        const response = await fetch(url, options);
        console.log(response)
        const responseParsed = (await response.json() as LLMResponse<string[]>);
        console.log(responseParsed.response)
        const promptList = (responseParsed.response as string[]).splice(0, 3);
        const images = promptList.map(async (prompt) => 
        {
            const imageURL = (await fetchImages([prompt]))[0].splice(0, 10); 
            return {
            prompt: prompt,
            imageURLS: imageURL
        } as ImageData});

        return await Promise.all(images);


    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Script")
    }
}


const IMAGE_GEN_PROMPT = `[INST] 
Consider yourself as an AI creative assistant helping users generate images using Midjourney. 
I will provide you with an  expert of an article, and I want you to provide me with a detailed prompt to feed into  The image maker Midjourney. 
it is important the result is visually stimulating  so ensure you give a detailed description of the image you want to generate.
Ensure the response is briev and to the point. Do not describe diagrams and instead describe a photo that would exist in the natural world that could be used to represent it

EXAMPLE 1:

INPUT:
"""
In extraordinary scenes, SNP MPs and some Tories walked out of the chamber over the Speaker's handling of the vote.
Following calls for him to return to explain his decision, Sir Lindsay told the Commons he chose to allow a vote on 
the Labour motion so MPs could express their view on "the widest range of propositions".
"""

OUTPUT:
"""
parliament building in postmodern architecture style + lyzergic acid + side effects + realistic + photorealistic + octane render + 3d render 
suited polititions streeming out of the building 
"""

EXAMPLE 2:

INPUT:
Journalist and author Bryony Gordon is an open book when it comes to talking about mental health, having lived with OCD, alcoholism, binge eating 
    disorder and drug addiction. But being a woman and navigating health inequality is one challenge she hasn't yet been able to overcome.

"""

OUTPUT:

"""
cyberpunk styled full body professional shot of plus sized alchoholic model, dressed in white shirt and black stockings, beautiful face, 
    neon-purple haris, glasses, faced camera, staying in middle of street, hands behind your head, holding a bottle of alcohol, deprived  
    in neon city decoration, heavy rain weather, front view

"""


Now produce the result for the following text below:
"""<<<TO BE REPLACED>>>"""
[/INST]
"""`

/**
 * Generates an open journey prompt based on the provided section.
 * @param section - The section containing the script data.
 * @returns A Promise that resolves to the generated open journey prompt as a string.
 * @throws Error if there is an error generating the script.
 */
export async function generateOpenJourneyPrompt(section: ScriptData): Promise<string>  {

    const prompt = IMAGE_GEN_PROMPT.replace("<<<TO BE REPLACED>>>", section.scriptTexts[section.selectedScriptIndex]);
    const params = new URLSearchParams();
   
    params.append("prompt",  prompt);
    params.append("schema", JSON.stringify(imageSchema));
    params.append("temperature", "0.7");
    const url = "https://iguana.alexo.uk/v3/generate";
    
    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        const response = await fetch(url, options);
        const responseParsed = (await response.json() as LLMResponse<string>);
        console.log(JSON.stringify(responseParsed.response))
        return responseParsed.response as string;
      
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Script")
    }
}

/**
 * Generates an image using the fastapi-img service based on the provided prompt.
 * @param prompt - The prompt for generating the image.
 * @returns A Promise that resolves to the destination path of the generated image.
 */
export async function  generateOpenJourneyImage (prompt: string): Promise<string>  {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("temperature", "1");
    form.append("negative_prompt", "ugly distorted ");
    form.append("num_inference_steps", "100");
    form.append("width", "1920");
    form.append("height", "1080");
    const { destination } = await downloadFile(
        'https://iguana.alexo.uk/v2/image',
        getProjectPath(),
        {
            method: 'POST',
            body: form,
        }
    );


    return "local:///" + destination
}


const EFFECT_GEN_PROMPT = `[INST] 
Consider yourself as an AI creative assistant helping users generate sound effects using AI audio generator. 
I will provide you with an expert of an article, and I want you to provide me with a simple prompt relavent to the article which I can feed into sound effect generator which should last 2-4 seconds. 
Ensure the response is brief and to the point. the sounds should be brief sounds

EXAMPLE 1:

INPUT:
"""
In extraordinary scenes, SNP MPs and some Tories walked out of the chamber over the Speaker's handling of the vote.
Following calls for him to return to explain his decision, Sir Lindsay told the Commons he chose to allow a vote on 
the Labour motion so MPs could express their view on "the widest range of propositions".
"""

OUTPUT:
"""
loud cameras clicking
"""

EXAMPLE 2:

INPUT:
"""
If you are not careful, the window will smash and you will be left cleaning up the pieces
"""

OUTPUT:
"""
Loud window smashing
"""

The conflict has been a chronicle of turmoil, carnage, and misery, influencing not only Ukraine but also Russia. The trajectory of the situation has been evident for years, reaching a turning point in 2022 with the complete invasion of Ukraine by President Putin, marked as a pivotal juncture

OUTPUT:
"""
Loud gunfire
"""

Now produce the result for the following text below:
"""<<<TO BE REPLACED>>>"""
[/INST]
"""`

const generateSoundEffectPrompt = async (section: ScriptData): Promise<string> => {

    const prompt = EFFECT_GEN_PROMPT.replace("<<<TO BE REPLACED>>>", section.scriptTexts[section.selectedScriptIndex]);
    const params = new URLSearchParams();
   
    params.append("prompt",  prompt);
    params.append("schema", JSON.stringify(imageSchema));
    params.append("temperature", "0.7");
    const url = "https://iguana.alexo.uk/v3/generate";
    
    const options = {
        method: "POST",
        body: params,
    };
    
    try {
        const response = await fetch(url, options);
        const responseParsed = (await response.json() as LLMResponse<string>);
        console.log("sound effect prompt:")
        console.log(JSON.stringify(responseParsed.response))
        return responseParsed.response as string;
      
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Effect Prompt")
    }
}


export const generateSoundEffect = async (section: ScriptData): Promise<ScriptData> => {

    const effectPrompt = await generateSoundEffectPrompt(section)

    const params = {
        "script": effectPrompt,
        "duration": 4
    }

    const url = "https://iguana.alexo.uk/v7/generate_audio";
    
    try {
        

        const { destination } = await downloadFile(url, getProjectPath(), {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        section.soundEffectPrompt = effectPrompt
        section.soundEffect = destination
        return section;
      
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Audio Effect")
    }
}