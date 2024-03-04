import { generateBackingTrack, textToAudio } from './audioService';
import { test, expect, vi } from "vitest";
import { ScriptData } from './mockData/data';

const mockStore =   new Map()
mockStore.set("script_selections", [])
vi.mock('./store.ts', () => ({
    getProjectStore: vi.fn().mockImplementation(() => mockStore),
  }))

vi.mock('./reportProcessing', () => ({
    downloadFile:  vi.fn().mockResolvedValue({ destination: '/path/to/audio', duration: 10 }),
}));
test('should return the correct BackingTrack object', async () => {
    // Mock the downloadFile function

    // Call the generateBackingTrack function
    const prompt = 'Test prompt';
    const duration = 10;
    const result = await generateBackingTrack(prompt, duration);

    // Assert the result
    expect(result).toEqual({ audioSrc: '/path/to/audio', audioDuration: duration });
    
});


test('should return the updated script with audio information', async () => {
    vi.mock('./reportProcessing', () => ({
        downloadFile:  vi.fn().mockResolvedValue({ destination: '/path/to/audio', headers: new Map([["audio-duration", "10"], ["media-location", "/remote/path/to/audio"]])}),
    }));

    // Prepare the test data
    const script: ScriptData = {
        scriptTexts: ['Script 1', 'Script 2'],
        selectedScriptIndex: 1,
        sadTalkerPath: '',
        scriptAudio: '',
        scriptDuration: 0,
        id: '',
        sectionName: ''
    };

    // Call the textToAudio function
    const updatedScript = await textToAudio(script);

    // Assert the updated script
    expect(updatedScript.sadTalkerPath).toEqual('/remote/path/to/audio');
    expect(updatedScript.scriptAudio).toEqual('/path/to/audio');
    expect(updatedScript.scriptDuration).toEqual(10);
});