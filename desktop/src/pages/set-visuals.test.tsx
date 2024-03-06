import { act, render, screen } from "@testing-library/react";
import { SetVisuals } from "./set-visuals";
import { MemoryRouter } from "react-router-dom";
import { mockApi } from "../lib/test-api";
import { vi } from "vitest";
import mockVisuals from "../../electron/mockData/visuals.json";
import mockAvatars from "../../electron/mockData/avatars.json";
import mockTopics from "../../electron/mockData/topics.json";
import mockAudiences from "../../electron/mockData/audiences.json";
import mockVoiceovers from "../../electron/mockData/voiceovers.json";
import { AudioContext as MockAudioContext } from "standardized-audio-context-mock";
// MockAudioContext.setOutputLatency(0.1);
// MockAudioContext.getOutputTimestamp, 
// MockAudioContext.createScriptProcessor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.AudioContext = MockAudioContext as any;

vi.stubGlobal("api", {});
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
describe("ScriptEditor", () => {
  it("should render the Title", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getVisuals: async () => mockVisuals,
      getProjectHasBackgroundAudio: async () => false,
      getProjectHasSoundEffect: async () => false,
      getProjectVisual: async () => mockVisuals[0],
      setProjectHasBackgroundAudio: async () => {},
      setProjectHasSoundEffects: async () => {},
      setVisual: async () => {},
      setAudience: async () => {},
      setVoiceover: async () => {},
      setAvatar: async () => {},
      getProjectHasAvatar: async () => false,
      getVoiceovers: async () => mockVoiceovers,
      getAudiences: async () => mockAudiences,
      getAvatars: async () => mockAvatars,
      getProjectAudience: async () => mockAudiences[0],
      getProjectVoiceover: async () => mockVoiceovers[0],
      getProjectTopic: async () => mockTopics[0],
      getProjectAvatar: async () => mockAvatars[0],
      getProjectHasSubtitles: async () => false,
      getProjectSubtitleStyle: async() => "80px sans-serif",
      getProjectLength: async () => 0,
      setProjectHasAvatar: async () => {},
      setProjectHasSubtitles: async () => {},
      setProjectSubtitleStyle: async () => {},
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <SetVisuals />
        </MemoryRouter>
      )
    );

    expect(screen.getByText("Project Settings")).toBeInTheDocument();
    expect(screen.getByText("Video Length")).toBeInTheDocument();
  });
});
