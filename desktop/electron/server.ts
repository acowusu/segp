import fetch from "node-fetch";
import type { ScriptData, ScriptData, Topic } from "./mockData/data";
export const generateTextFromLLM = async (
    systemPrompt: string,
    userPromp: string,
    temperature: number,
    startOfResponse:string
): Promise<string> => {

    const params = new URLSearchParams();

    params.append("prompt", `[INST] ${systemPrompt}  ${userPromp} [/INST]${startOfResponse}`);
    params.append("temperature", "1");
    // console.log(systemPrompt, userPromp, temperature);
    const url = "https://iguana.alexo.uk/v1/generate";

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


const TOPICS_SYS = `<<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
Format the response as a json list following this schema:
<SCHEMA>
{
  topic: string;
  summary: string;
}
</SCHEMA>
<EXAMPLE>
\`\`\`json
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
\`\`\`
</EXAMPLE>
Give the topics mentioned in the following article
<</SYS>>`

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
export const generateScript = async (report:string): Promise<ScriptData[]> => {
    
    for (let i = 0; i < 5; i++) {
        try {
            return await generateScriptInternal(report)
        } catch (error) {
            console.log("error parsing", i)
        }
        
    }
    throw Error("Keeps failing")

}

const generateTopicsInternal =async (report:string):Promise<Topic[]> => {
    let result = await generateTextFromLLM(TOPICS_SYS, report, 1, "```json");
    // const topics = result.split('\n').map((line) => {
    //     return {
    //         topic: line,
    //         summary: "",
    //     }
    // });
    result = result.replace(/```/g, '')
    result = result.substring(1, result.length-1)
    const isNotList = !result.includes("[")
    const hasNoObjects = !result.includes("{")

    if(result.includes("[") && !result.includes("]")){
        result = result.substring(0, result.lastIndexOf("}")+1) +"]"
    }
    console.log("--------------------------------------------------");
    console.log(result);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
    let topics = JSON.parse(result.replace(/```/g, ''))
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
    return topics;
    
}

const SCRIPT_SYS = `<<SYS>>
Generate the script for a radio voiceover summary based on the article provided.
<</SYS>>
<</SYS>>`
const generateScriptInternal =async (report:string):Promise<ScriptData[]> => {
    let result = await generateTextFromLLM(SCRIPT_SYS, report, 1, "Today, we are discussing the");
    result = "Today, we are discussing the" + result
    const segs = result.split('.').map((line, i) => {
        
                return {
                    section: i.toString(),
                    script1: line,
                    script2: "",
                        }
         
    })
    return segs;
    
}


