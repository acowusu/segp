import { getVisuals, getVoiceovers, getTopics, getAudiences } from "./reportProcessing";
import voiceovers from './mockData/voiceovers.json'
import topics from './mockData/topics.json'
import audiences from './mockData/audiences.json'
import { test, expect } from "vitest";

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

