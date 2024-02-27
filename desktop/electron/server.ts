import { getProjectPath } from "./metadata";
import type { ScriptData, Topic } from "./mockData/data";
import { downloadFile } from "./reportProcessing";
import scriptSchema from "./schemas/script.json";
import topicSchema from "./schemas/topic.json";
import imageSchema from "./schemas/image.json";

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

export const generateTextFromLLM = async (
    prompt: string,
    raw: boolean = false
): Promise<string> => {

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

export const generateTopics = async (report: string): Promise<Topic[]> => {

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
        return responseParsed.sections!.map((section:LLMSection) => {
            return section.sentences.map((sentence, i) =>{
                return {
                    id: performance.now().toString(16),
                    selectedScriptIndex: 0,
                    sectionName: section.title + " Part " + (i+1).toString(),
                    scriptTexts: [sentence.text],
                    }
            })
            
        }).flat()   ;
    } catch (err) {
        console.error("error:" + err);
        throw Error("Error generating Script")
    }
}




// TODO set settings here 







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

export const generateOpenJourneyPrompt = async (section: ScriptData): Promise<string> => {

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

export const generateOpenJourneyImage = async (prompt: string): Promise<string> => {
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


    return destination
}