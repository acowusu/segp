import { setVoiceover, setAudience, setVisual, setTopic, getVoiceovers, getVisuals, getAudiences, getScript } from "./reportProcessing";
import voiceovers from './mockData/voiceovers.json'
import topics from './mockData/topics.json'
import audiences from './mockData/audiences.json'
import visuals from './mockData/visuals.json'
import { test, expect, vi } from "vitest";
const mockStore =   new Map()
mockStore.set("voiceover", voiceovers[0])
mockStore.set("audience", audiences[0])
mockStore.set("visual", visuals[0])
mockStore.set("topic", topics[0])
mockStore.set("script_selections", [])
vi.mock('./store.ts', () => ({
    getProjectStore: vi.fn().mockImplementation(() => mockStore),
  }))
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




test("setVoiceover should log the voiceover", async () => {    
    await setVoiceover(voiceovers[1]);
    expect(mockStore.get("voiceover")).toEqual(voiceovers[1]);
});

test("setAudience should log the audience", async () => {    
    const audience = audiences[1];
    await setAudience(audience);
    
    expect(mockStore.get("audience")).toEqual(audience);
});

test("setVisual should set the visual", async () => {
    const visual = visuals[1];
    await setVisual(visual);

  
    expect(mockStore.get("visual")).toEqual(visual);
});

test("setTopic should set the topic", async () => {
    const topic = topics[1];
    await setTopic(topic);
    expect(mockStore.get("topic")).toEqual(topic);
});

