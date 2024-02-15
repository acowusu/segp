import { getVisuals, getVoiceovers, getAudiences, setVoiceover, setAudience, setVisual, setTopic, getScript } from "./reportProcessing";
import voiceovers from './mockData/voiceovers.json'
import topics from './mockData/topics.json'
import audiences from './mockData/audiences.json'
import visuals from './mockData/visuals.json'
import { test, expect, vi } from "vitest";

test("getVoiceovers should return an array of voiceovers", async () => {
    const result = await getVoiceovers();
    expect(result).toEqual(voiceovers);
});

test("getVisuals should return an array of visuals", async () => {
    const visuals = await getVisuals();
    expect(Array.isArray(visuals)).toBe(true);
});


test("getAudiences should return an array of audiences", async () => {
    const result = await getAudiences();
    expect(result).toEqual(audiences);
});

test("getScript should return an array of segments", async () => {
    const result = await getScript();
    expect(Array.isArray(result)).toBe(true);
});



test("setVoiceover should log the voiceover", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    await setVoiceover(voiceovers[0]);
    
    expect(consoleSpy).toHaveBeenCalledWith(voiceovers[0]);
});

test("setAudience should log the audience", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    const audience = audiences[0];
    await setAudience(audience);
    
    expect(consoleSpy).toHaveBeenCalledWith(audience);
});

test("setVisual should set the visual", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const visual = visuals[0];
    await setVisual(visual);

  
    expect(consoleSpy).toHaveBeenCalledWith(visual);
});

test("setTopic should set the topic", async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const topic = topics[0];
    await setTopic(topic);


    expect(consoleSpy).toHaveBeenCalledWith(topic);
});

