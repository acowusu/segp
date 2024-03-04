import { ScriptData } from './mockData/data';
import { generateOpenJourneyImage, generateOpenJourneyPrompt } from './server';
import { describe, expect, it, vi } from "vitest";


const mockStore = new Map()
mockStore.set("script_selections", [])
vi.mock('./store.ts', () => ({
    getProjectStore: vi.fn().mockImplementation(() => mockStore),
}))

vi.mock('./reportProcessing', () => ({
    downloadFile: vi.fn().mockResolvedValue({ destination: '/path/to/audio', duration: 10 }),
}));




describe('generateOpenJourneyPrompt', () => {
    it('should generate an open journey prompt', async () => {
        const section: ScriptData = {
            scriptTexts: ['Script 1', 'Script 2'],
            selectedScriptIndex: 0,
            id: '',
            sectionName: ''
        };
        const mockFetch = vi.fn().mockResolvedValueOnce({
            status: 200,
            json: vi.fn().mockResolvedValue({ prompt: "This is a prompt", response: "This is a response" }),

        })
        global.fetch = mockFetch;

        const prompt = await generateOpenJourneyPrompt(section);
        expect(prompt).toBeDefined();
        // Add more assertions as needed
    });
});

describe('generateOpenJourneyImage', () => {
    it('should generate an open journey image', async () => {
        const prompt = 'Enter your prompt here';
        const image = await generateOpenJourneyImage(prompt);
        expect(image).toBeDefined();
    });
});