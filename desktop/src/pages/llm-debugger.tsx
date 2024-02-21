import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea'
import { Topic } from '../../electron/mockData/data';
import { cn } from '../lib/utils';

// const DEFAULT_SYS = "<<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.<</SYS>>"
const DEFAULT_USER  = "```Public Holidays: Equatorial Guinea’s Vice President Insists Superyacht in Italian Vacation Hotspots is a Military VesselNovember 2, 2023Equatorial GuineaShip TrackingEquatorial Guinea’s Vice President says that the luxury yacht Blue Shadow belongs to the African country’s Ministry of Defence. Why, then, has it spent the last few months travelling to swanky vacation destinations in the Mediterranean? Using open source vessel tracking data, along with satellite imagery and publicly available social media posts, Bellingcat has located Blue Shadow — and a second superyacht reportedly owned by the Equatorial Guinean government — at various ports and anchorages in Portugal and Italy since June 2023.Flight tracking data also show that an Equatorial Guinean government aircraft and a private jet frequently used by Teodoro Nguema Obiang, the country’s vice president since 2016, made multiple trips to and from airports in Italy in close proximity to Blue Shadow from September 11 to October 3, 2023.In one instance, the private jet flew to Sardinia, where the superyachts Blue Shadow and Ice had already arrived. Five days later, the plane departed for Milan, where posts on his Instagram account show that Obiang, who is nicknamed Teodorín, attended a runway show at Milan Fashion Week. Afterwards, he headed to this year’s UN General Assembly in New York.```"
const DEFAULT_SYS = `
<<SYS>>You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
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
]</EXAMPLE>
Give the topics mentioned in the following article
<</SYS>>`
export const LLMDebugger = () => {
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYS);
    const [userPrompt, setUserPrompt] = useState(DEFAULT_USER);
    const [startOfResponse, setStartOfResponse] = useState("[");
    const [temperature, setTemperature] = useState(0);
    const [llmResponse, setLLmResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [topicsList, setTopicsList] = useState<Topic[]>([]);

    const handleSubmit = async () => {
            if(isLoading) return;
            setIsLoading(true);
            // setLLmResponse(await window.api.generateTextFromLLM(systemPrompt, userPrompt, temperature, startOfResponse));
            setLLmResponse(await window.api.generateTextFromLLM(userPrompt));
            setIsLoading(false);
    };
    const handleGetTopics = async () => {
        if(isLoading) return;
        setIsLoading(true);
        setTopicsList(await window.api.generateTopics(userPrompt));
        setIsLoading(false);
};

    return (
        <div className="grid grid-cols-2 gap-4 ">
            <div>
                <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="System Prompt"
                    className="mb-4 h-48"
                />
                <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="User Prompt"
                    className="mb-4 h-96"
                />
                <Input
                    type="text"
                    value={startOfResponse}
                    onChange={(e) => setStartOfResponse(e.target.value)}
                    placeholder="Temperature"
                    className="mb-4"
                />
                <Input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    placeholder="Temperature"
                    className="mb-4"
                />

                <Button disabled={isLoading} onClick={handleSubmit} variant={"destructive"} className="mx-4">
                    Submit
                </Button>
                <Button disabled={isLoading} onClick={handleGetTopics} variant={"default"} className="mx-4">
                    Get Topics
                </Button>
            </div>
            <div>
                <div className="text-center bg-pink-500/40 p-2 rounded text-pink-700 monospace">
                    {/* <pre> */}
                    {llmResponse}
                    {/* </pre> */}
                </div>
                {topicsList.map((item) => (
                <button
                  key={item.topic}
                  className={cn(
                    "flex flex-col mt-4 items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                  )}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{item.topic}</div>
                      </div>
                    </div>
                    {/* <div className="text-xs font-medium">{item.subject}</div> */}
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {item.summary}
                  </div>
                </button>
              ))}
            </div>
        </div>
    );
};

