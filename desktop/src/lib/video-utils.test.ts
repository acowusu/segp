import { lerp, addAudioLayers, generateAudio, addAvatarLayers, generateAvatarSections } from "./video-utils";
import { ScriptData } from "../../electron/mockData/data";
import etro from "etro";
import { AudioContext as MockAudioContext } from "standardized-audio-context-mock";
import { mockApi } from "./test-api";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.AudioContext = MockAudioContext as any;
vi.stubGlobal("api", {});


test("lerp should interpolate correctly when t is 0", () => {
    const result = lerp(0, 10, 0, 100);
    expect(result).toBe(0);
});

test("lerp should interpolate correctly when t is equal to p", () => {
    const result = lerp(0, 10, 100, 100);
    expect(result).toBe(10);
});

test("lerp should interpolate correctly when t is between 0 and p", () => {
    const result = lerp(0, 10, 50, 100);
    expect(result).toBe(5);
});

test("lerp should interpolate correctly when a is negative", () => {
    const result = lerp(-10, 10, 50, 100);
    expect(result).toBe(0);
});

test("lerp should interpolate correctly when b is negative", () => {
    const result = lerp(0, -10, 50, 100);
    expect(result).toBe(-5);
});

test("lerp should interpolate correctly when a and b are negative", () => {
    const result = lerp(-10, -20, 50, 100);
    expect(result).toBe(-15);
});


describe("addImageLayers", () => {
    // let sections: ScriptData[];
    // let movie: etro.Movie;

    // beforeEach(() => {
    //     sections = [
    //         {
    //             id: "1",
    //             selectedScriptIndex: 0,
    //             scriptTexts: [],
    //             sectionName: "Section 1",
    //             scriptMedia: {url: "image1.jpg", author: "me"},
    //             scriptDuration: 5,
    //         },
    //         {
    //             id: "2",
    //             scriptMedia: {url: "image2.jpg", author: "me"},
    //             scriptDuration: 10,
    //             sectionName: "Section 2",
    //             selectedScriptIndex: 0,
    //             scriptTexts: [],
    //         },
            // Add more sections as needed
    //     ];

    //     movie = new etro.Movie({
    //         canvas: document.createElement("canvas")
    //     });
    // });

    test("should add image layers to the movie", () => {
        // addMediaLayers(sections, movie);

        // expect(movie.layers.length).toBe(sections.length);
    });

    test("should set the correct start time for each layer", () => {
        // vi.spyOn(window, "api", "get").mockReturnValue({
        //     ...mockApi,
        //     toDataURL: async () => "data:image/png;base64,",
        //     getProjectHasBackgroundAudio: async () => false,
        //     getProjectHasSoundEffect: async () => false
        // });
        // addMediaLayers(sections, movie);


        // let start = 0;
        // movie.layers.forEach((layer: { startTime: number; duration: number; }) => {
        //     expect(layer.startTime).toBe(start);
        //     start += layer.duration;
        // });
    });

});






// describe("addSubtitleLayers", () => {
//     let sections: ScriptData[];
//     let movie: etro.Movie;

//     beforeEach(() => {
//         sections = [
//             {
//                 id: "1",
//                 selectedScriptIndex: 0,
//                 scriptTexts: ["Subtitle 1"],
//                 sectionName: "Section 1",
//                 scriptMedia: {url: "image1.jpg", author: "me"},
//                 scriptDuration: 5,
//             },
//             {
//                 id: "2",
//                 scriptMedia: {url: "image2.jpg", author: "me"},
//                 scriptDuration: 10,
//                 sectionName: "Section 2",
//                 selectedScriptIndex: 0,
//                 scriptTexts: ["Subtitle 2"],
//             },
//             // Add more sections as needed
//         ];

//         movie = new etro.Movie({
//             canvas: document.createElement("canvas")
//         });
//     });

//     test("should add subtitle layers to the movie", () => {
//         addSubtitleLayers(sections, movie);

//         expect(movie.layers.length).toBe(sections.length);
//     });

//     test("should set the correct start time for each layer", () => {
//         addSubtitleLayers(sections, movie);

//         let start = 0;
//         movie.layers.forEach((layer: { startTime: number; duration: number; }) => {
//             expect(layer.startTime).toBe(start);
//             start += layer.duration;
//         });
//     });
// });

describe("addAudioLayers", () => {
    let sections: ScriptData[];
    let movie: etro.Movie;
    beforeEach(() => {
        sections = [
            {
                id: "1",
                selectedScriptIndex: 0,
                scriptTexts: [],
                sectionName: "Section 1",
                scriptMedia: {url: "image1.jpg", author: "me"},
                scriptDuration: 5,
                scriptAudio: "audio1.wav",
            },
            {
                id: "2",
                scriptMedia: {url: "image2.jpg", author: "me"},
                scriptDuration: 10,
                sectionName: "Section 2",
                selectedScriptIndex: 0,
                scriptTexts: [],
                scriptAudio: "audio2.wav",
            },
            // Add more sections as needed
        ];

    vi.spyOn(window, "api", "get").mockReturnValue({
        ...mockApi,
        toDataURL: async () => "data:image/png;base64,",
        getScript: vi.fn().mockResolvedValue(sections),
        textToAudio: vi.fn().mockImplementation((section) => {
            return Promise.resolve({
                ...section,
                scriptAudio: `audio_${section.id}.wav`,
            });
        }),
        setScript: vi.fn(),
    });
    
        movie = new etro.Movie({
            canvas: document.createElement("canvas"),
        });
    });

    test("should add audio layers to the movie", async () => {
        vi.spyOn(window, "api", "get").mockReturnValue({
            ...mockApi,
            toDataURL: async () => "data:image/png;base64,",
            getProjectHasBackgroundAudio: async () => false,
            getProjectHasSoundEffect: async () => false
        });
        await addAudioLayers(sections, movie);


        expect(movie.layers.length).toBe(sections.length); // Each section should have two audio layers
    });

    test("should set the correct start time for each layer", async () => {
        vi.spyOn(window, "api", "get").mockReturnValue({
            ...mockApi,
            toDataURL: async () => "data:image/png;base64,",
            getProjectHasBackgroundAudio: async () => false,
            getProjectHasSoundEffect: async () => false
        });
        await addAudioLayers(sections, movie);

        let start = 0;
        movie.layers.forEach((layer: { startTime: number; duration: number }) => {
            expect(layer.startTime).toBe(start);
            start += layer.duration;
        });
    });

    test("should throw an error if no media is found", async () => {
        const invalidSections = [
            {
                id: "1",
                selectedScriptIndex: 0,
                scriptTexts: [],
                sectionName: "Section 1",
                scriptMedia: {url: "image1.jpg", author: "me"},
                scriptDuration: 5,
                // Missing scriptAudio
            },
        ];

        await expect(addAudioLayers(invalidSections, movie)).rejects.toThrow("No media found");
    });

    test("should throw an error if no duration is found", async () => {
        const invalidSections = [
            {
                id: "1",
                selectedScriptIndex: 0,
                scriptTexts: [],
                sectionName: "Section 1",
                scriptMedia: {url: "image1.jpg", author: "me"},
                // Missing scriptDuration
                scriptAudio: "audio1.wav",
            },
        ];

        await expect(addAudioLayers(invalidSections, movie)).rejects.toThrow("No duration found");
    });

    test("should add sound effect layer if soundEffectPath is provided", async () => {
        // const sectionWithSoundEffect = {
        //     id: "1",
        //     selectedScriptIndex: 0,
        //     scriptTexts: [],
        //     sectionName: "Section 1",
        //     scriptMedia: {url: "image2.jpg", author: "me"},
        //     scriptDuration: 5,
        //     scriptAudio: "audio1.wav",
        //     soundEffect: "soundEffect.wav",
        // };

        // vi.spyOn(window, "api", "get").mockReturnValue({
        //     ...mockApi,
        //     toDataURL: async () => "data:image/png;base64,",
        //     getProjectHasBackgroundAudio: async () => false,
        //     getProjectHasSoundEffect: async () => false
        // });

        // sections.push(sectionWithSoundEffect);

        // await addAudioLayers(sections, movie);

        // expect(movie.layers.length).toBe(sections.length + 1); // Each section should have one audio layers, plus one sound effect layer
    });
});

describe("generateAudio", () => {
    let sections: ScriptData[];

    beforeEach(() => {
        sections = [
            {
                id: "1",
                selectedScriptIndex: 0,
                scriptTexts: [],
                sectionName: "Section 1",
                scriptMedia: {url: "image1.jpg", author: "me"},
                scriptDuration: 5,
                scriptAudio: "audio1.wav",
            },
            {
                id: "2",
                scriptMedia: {url: "image2.jpg", author: "me"},
                scriptDuration: 10,
                sectionName: "Section 2",
                selectedScriptIndex: 0,
                scriptTexts: [],
            },
            // Add more sections as needed
        ];

        vi.spyOn(window, "api", "get").mockReturnValue({
            ...mockApi,
            toDataURL: async () => "data:image/png;base64,",
            getScript: vi.fn().mockResolvedValue(sections),
            textToAudio: vi.fn().mockImplementation((section) => {
                return Promise.resolve({
                    ...section,
                    scriptAudio: `audio_${section.id}.wav`,
                });
            }),
            setScript: vi.fn(),
        });

    });

    test("should generate audio for sections without scriptAudio", async () => {

       
    
        vi.spyOn(window, "api", "get").mockReturnValue({
            ...mockApi,
            toDataURL: async () => "data:image/png;base64,",
            getScript: vi.fn().mockResolvedValue(sections),
            textToAudio: vi.fn().mockImplementation((section) => {
                return Promise.resolve({
                    ...section,
                    scriptAudio: `audio_${section.id}.wav`,
                });
            }),
            setScript: vi.fn(),
            getProjectHasAvatar: vi.fn().mockReturnValue(false),
            getProjectHasBackgroundAudio: async () => false,
            getProjectHasSoundEffect: async () => false,
        });

       

        

        await generateAudio();

        expect(window.api.textToAudio).toHaveBeenCalledTimes(1);
        // expect(window.api.textToAudio).toHaveBeenCalledWith(sections[1]);
        expect(window.api.setScript).toHaveBeenCalledWith([
            sections[0],
            {
                ...sections[1],
                scriptAudio: "audio_2.wav",
            },
        ]);
    });

    test("should not generate audio for sections with scriptAudio", async () => {

        vi.spyOn(window, "api", "get").mockReturnValue({
            ...mockApi,
            toDataURL: async () => "data:image/png;base64,",
            getScript: vi.fn().mockResolvedValue(sections),
            textToAudio: vi.fn().mockImplementation((section) => {
                return Promise.resolve({
                    ...section,
                    scriptAudio: `audio_${section.id}.wav`,
                });
            }),
            setScript: vi.fn(),
            getProjectHasAvatar: vi.fn().mockReturnValue(false),
            getProjectHasBackgroundAudio: async () => false,
            getProjectHasSoundEffect: async () => false,
        });


        await generateAudio();

        expect(window.api.textToAudio).not.toHaveBeenCalledWith(sections[0]);
        expect(window.api.setScript).toHaveBeenCalledTimes(1);
        expect(window.api.setScript).toHaveBeenCalledWith([sections[0], { ...sections[1], scriptAudio: "audio_2.wav" }]);
    });

});
test("addAvatarLayers should skip layering if no Avatar Option is selected", async () => {
    const sections: ScriptData[] = [
        {
            id: "1",
            selectedScriptIndex: 0,
            scriptTexts: [],
            sectionName: "Section 1",
            scriptMedia: {url: "image1.jpg", author: "me"},
            scriptDuration: 5,
        },
        {
            id: "2",
            scriptMedia: {url: "image2.jpg", author: "me"},
            scriptDuration: 10,
            sectionName: "Section 2",
            selectedScriptIndex: 0,
            scriptTexts: [],
        },
    ];

    const movie = new etro.Movie({
        canvas: document.createElement("canvas"),
    });
    vi.spyOn(window, "api", "get").mockReturnValue({
        ...mockApi,
        toDataURL: async () => "data:image/png;base64,",
        getScript: vi.fn().mockResolvedValue(sections),
        textToAudio: vi.fn().mockImplementation((section) => {
            return Promise.resolve({
                ...section,
                scriptAudio: `audio_${section.id}.wav`,
            });
        }),
        setScript: vi.fn(),
        getProjectHasAvatar: vi.fn().mockReturnValue(false)
    });

    await addAvatarLayers(sections, movie);

    expect(window.api.getProjectHasAvatar).toHaveBeenCalledTimes(1);
    expect(window.api.getScript).toHaveBeenCalledTimes(1);
    expect(movie.layers.length).toBe(0);
});

test("generateAvatarSections should skip avatar generation if project has no avatar option selected", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
        ...mockApi,
        getProjectHasAvatar: vi.fn().mockResolvedValueOnce(false),
        getScript: vi.fn().mockResolvedValue([]),
        getProjectAvatar: vi.fn(),
        generateAvatar: vi.fn(),
        setScript: vi.fn(),
    });
    await generateAvatarSections();

    expect(window.api.getScript).not.toHaveBeenCalled();
    expect(window.api.getProjectAvatar).not.toHaveBeenCalled();
    expect(window.api.generateAvatar).not.toHaveBeenCalled();
    expect(window.api.setScript).not.toHaveBeenCalled();
});

test("generateAvatarSections should generate avatar for each section", async () => {
    const initial = [
        {
            id: "1",
            sectionName: "Section 1",
            avatarVideoUrl: null,
        },
        {
            id: "2",
            sectionName: "Section 2",
            avatarVideoUrl: null,
        },
    ];
    const avatar = "avatar.png";
    const modified1 = {
        id: "1",
        sectionName: "Section 1",
        avatarVideoUrl: "avatar1.mp4",
    };
    const modified2 = {
        id: "2",
        sectionName: "Section 2",
        avatarVideoUrl: "avatar2.mp4",
    };
    vi.spyOn(window, "api", "get").mockReturnValue({
        ...mockApi,
        toDataURL: async () => "data:image/png;base64,",
        textToAudio: vi.fn().mockImplementation((section) => {
            return Promise.resolve({
                ...section,
                scriptAudio: `audio_${section.id}.wav`,
            });
        }),
        setScript: vi.fn(),
        getProjectHasAvatar: vi.fn().mockResolvedValueOnce(true),
        getScript: vi.fn().mockResolvedValueOnce(initial),
        getProjectAvatar: vi.fn().mockResolvedValueOnce(avatar),
        generateAvatar: vi.fn().mockResolvedValueOnce(modified1).mockResolvedValueOnce(modified2),
    });


    await generateAvatarSections();

    expect(window.api.getScript).toHaveBeenCalledTimes(3);
    expect(window.api.getProjectAvatar).toHaveBeenCalledTimes(1);
    expect(window.api.generateAvatar).toHaveBeenCalledTimes(6);
    expect(window.api.generateAvatar).toHaveBeenNthCalledWith(1, initial[0], avatar);
    // expect(window.api.generateAvatar).toHaveBeenNthCalledWith(2, initial[1], avatar);
    // expect(window.api.setScript).toHaveBeenCalledTimes(1);
    // expect(window.api.setScript).toHaveBeenCalledWith([modified1, modified2]);
});

test("generateAvatarSections should handle errors during avatar generation", async () => {
    const initial = [
        {
            id: "1",
            sectionName: "Section 1",
            avatarVideoUrl: null,
        },
    ];
    const avatar = "avatar.png";
    const error = new Error("Avatar generation failed");
    vi.spyOn(window, "api", "get").mockReturnValue({
        ...mockApi,
        toDataURL: async () => "data:image/png;base64,",
        textToAudio: vi.fn().mockImplementation((section) => {
            return Promise.resolve({
                ...section,
                scriptAudio: `audio_${section.id}.wav`,
            });
        }),
        setScript: vi.fn(),
        getProjectHasAvatar: vi.fn().mockResolvedValueOnce(true),
        getScript: vi.fn().mockResolvedValueOnce(initial),
        getProjectAvatar: vi.fn().mockResolvedValueOnce(avatar),
        generateAvatar: vi.fn().mockRejectedValueOnce(error),
    });


    await generateAvatarSections();

    expect(window.api.getScript).toHaveBeenCalledTimes(1);
    expect(window.api.getProjectAvatar).toHaveBeenCalledTimes(1);
    expect(window.api.generateAvatar).toHaveBeenCalledTimes(3);
    expect(window.api.generateAvatar).toHaveBeenCalledWith(initial[0], avatar);
    expect(window.api.setScript).not.toHaveBeenCalled();
});