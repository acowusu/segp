import fetch from "node-fetch";
import type { ScriptData, Topic } from "./mockData/data";
import { getProjectAudience, getProjectLength } from "./projectData";



export const generateTextFromLLM = async (
    prompt: string,
): Promise<string> => {

    const params = new URLSearchParams();

    params.append("prompt", `[INST] ${prompt} [/INST] `);
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
        const responseText = (await response.text()).replace(/\\n/g, '\n').replace(/\\"/g, '"');
        
        return responseText;
    } catch (err) {
        console.error("error:" + err);
        return "";
    }
};

// <<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
// Format the response as a json list following this schema:
// <SCHEMA>
// {
//   topic: string;
//   summary: string;
// }
// </SCHEMA>
// <EXAMPLE>
// [
//   {
//       "topic": "Overview of Deep Convolutional Neural Networks",
//       "summary": "An introduction to deep convolutional neural networks, their significance in image classification, and their revolutionary impact on computer vision."
//   },
//   {
//       "topic": "The ImageNet Challenge: Revolutionizing Object Recognition",
//       "summary": "Exploring the role of the ImageNet Large Scale Visual Recognition Challenge (ILSVRC) in advancing neural network research and object recognition technologies."
//   },</EXAMPLE>
// Give the topics mentioned in the following article
// <</SYS>>

//  Here are the topics mentioned in the article you provided: 



const TOPICS_FORMAT = `
Format the response as a json list following this schema:
<SCHEMA>
{
  topic: string;
  summary: string;
}
</SCHEMA>
<EXAMPLE>
[
  {
      "topic": "Overview of Deep Convolutional Neural Networks",
      "summary": "An introduction to deep convolutional neural networks, their significance in image classification, and their revolutionary impact on computer vision."
  },
  {
      "topic": "The ImageNet Challenge: Revolutionizing Object Recognition",
      "summary": "Exploring the role of the ImageNet Large Scale Visual Recognition Challenge (ILSVRC) in advancing neural network research and object recognition technologies."
  }
]
</EXAMPLE>
`

const REFORMAT = `
Format the stuff above as a json list following this schema:
<SCHEMA>
{
    sectionName: string;
    scriptTexts: string[];
}
</SCHEMA>
<EXAMPLE>
[
  {
      "sectionName": "Overview of Deep Convolutional Neural Networks",
      "scriptTexts": ["...", "..."]
  },
  {
      "sectionName": "The ImageNet Challenge: Revolutionizing Object Recognition",
      "scriptTexts": ["...", "..."]
  }
]
</EXAMPLE>

Make sure that the different variations of scripts are not section names. make sure they they are in the scriptText section.
`





export const generateTopics = async (report:string): Promise<Topic[]> => {
    
    for (let i = 0; i < 5; i++) {
        try {
            return await generateTopicsInternal(report)
        } catch (error) {
            console.log("error parsing", i)
        }
        
    }
    throw Error("Keeps failing")

}
export const generateScript = async (topic: string, report:string): Promise<ScriptData[]> => {
    
    for (let i = 0; i < 5; i++) {
        try {
            return await generateScriptInternal(topic, report)
        } catch (error) {
            console.log("error parsing", i)
        }
        
    }
    throw Error("Keeps failing")
}


const generateTopicsInternal =async (report:string):Promise<Topic[]> => {

    const projectLength = getProjectLength()

    const TOPICS_SYS = `
    Below is some information.
    Find me a list of topics from this information which you could create an informative ${projectLength} minute video out of. In the result, also return an overview of the entirety of the information. 
    For this video, you can use general knowledge, but you should aim to use only information which is supplied in the information. If there is information which conflicts with your knowledge, assume that the information provided is right:
    `

    const prompt = TOPICS_SYS + report + TOPICS_FORMAT

    let result = await generateTextFromLLM(prompt);

    result = result.substring(prompt.length + 16, result.length-1)
    
    const isNotList = !result.includes("[")
    const hasNoObjects = !result.includes("{")

    console.log("--------------------------------------------------");
    console.log(result);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
    let topics = JSON.parse(result)
    if(isNotList){
        topics = [topics]
    }
    if (hasNoObjects) {
        topics = topics.map(
            (s:string)=>{
                return {
                            topic: s,
                            summary: "",
                        }
            }
        )
    }
    return topics

    
}

const SCRIPTS_FORMAT = `
[END OF REPORT]

Format the response as a json list following this schema:
{
    sectionName: string;
    scriptTexts: string[];
}

The response should look something like this:
[{
    sectionName: ...;
    scriptTexts: [...]; 
},...]
`

const generateScriptInternal =async (topic:string, report: string):Promise<ScriptData[]> => {

    const projectLength = getProjectLength()
    const projectAudience = getProjectAudience()

    console.log("generating scripts")
    // TODO set settings here 
    
    const SCRIPT_SYS = `
    Below is some information. 
    Create a ${projectLength} minute script about ${topic} for an audience of ${projectAudience} only using the information below. The script should be split up into as many sections as you deem necessary, where each section is a different part of the video and they should seamlessly connect together. for each section, create me 3 or more completely different scripts for that section, so that i can choose my favorite.
    `

    let prompt = SCRIPT_SYS + report + SCRIPTS_FORMAT;
    
    let result = await generateTextFromLLM(prompt);

    result = result.substring(prompt.length + 16, result.length-1)

    console.log("--------------------------------------------------");
    console.log(result);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");

    try {
        let scripts = JSON.parse(result)

        let addedInfoScripts = scripts.map((script: {sectionName: string; scriptTexts: string[]}, index: number) => {
            return {...script, id: String(index), selectedScriptIndex: 1, sectionImageLookup: []} as ScriptData
        })
        return generateImageLookup(addedInfoScripts);
        // let scripts = mock
    } catch (e) {
        const prompt = result + REFORMAT
        let regenerated_result = await generateTextFromLLM(prompt);

        regenerated_result = regenerated_result.substring(prompt.length + 16, regenerated_result.length-1)

        console.log("--------------------------------------------------");
        console.log(regenerated_result);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");

        let scripts = JSON.parse(regenerated_result)
        
        let addedInfoScripts = scripts.map((script: {sectionName: string; scriptTexts: string[]}, index: number) => {
            return {...script, id: String(index), selectedScriptIndex: 1, sectionImageLookup: []} as ScriptData
        })
        return generateImageLookup(addedInfoScripts);
    }
        
}

const generateImageLookup =async (data: ScriptData[]):Promise<ScriptData[]> => {

    const mappedPromises = data.map(async (scriptData) => {
        const IMAGE_SYS = `Return me a list of keyword which best summarises the script below. These should be easy to find an image of. return me only the list of keywords, in the form of ["keyword", "keuword2"...]`;
        
        let prompt = IMAGE_SYS + scriptData.scriptTexts[0];
        
        let result = await generateTextFromLLM(prompt);
        
        result = result.substring(prompt.length + 16, result.length-1);
        
        const openBracketIndex = result.indexOf('[') - 1;
        const closeBracketIndex = result.indexOf(']') + 1;
        
        result = result.substring(openBracketIndex + 1, closeBracketIndex);
        
        console.log(result);
        
        try {
            const imageLookups = JSON.parse(result) as string[]
            
            return {...scriptData, sectionImageLookup: imageLookups}
            
        } catch(e) {
            console.log("DID NOT WORK")    
            return scriptData        
        }
    });
    
    return await Promise.all(mappedPromises);
    
}

