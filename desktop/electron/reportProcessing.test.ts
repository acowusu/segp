import { getVisuals, getVoiceovers, getTopics, getAudiences, setVoiceover, setAudience, setVisual } from "./reportProcessing";
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

test("getTopics should return an array of topics", async () => {
    const result = await getTopics();
    expect(result).toEqual(topics);
});

test("getAudiences should return an array of audiences", async () => {
    const result = await getAudiences();
    expect(result).toEqual(audiences);
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
