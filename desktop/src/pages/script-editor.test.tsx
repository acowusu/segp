import { act, render, screen } from "@testing-library/react";
import { ScriptEditor } from "./script-editor";
import { MemoryRouter } from "react-router-dom";
import { mockApi } from "../lib/test-api";
import { vi } from "vitest";
import topics from "../../electron/mockData/topics.json";
vi.stubGlobal("api", {});

describe("ScriptEditor", () => {

  it("should render the Title", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      getProjectHasSoundEffect: async () => false
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <ScriptEditor />
        </MemoryRouter>
      )
    );

    expect(screen.getByText("Script Editor")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });
});

describe("ScriptEditor", () => {
  beforeEach(() => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      // setScript: vi.fn().mockResolvedValue({}),
    });
  });

  it("should render the Title", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      getProjectHasSoundEffect: async () => false
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <ScriptEditor />
        </MemoryRouter>
      )
    );

    expect(screen.getByText("Script Editor")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  it("should handle showing drafts", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      setScript: vi.fn().mockResolvedValue({}),
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      getProjectHasSoundEffect: async () => false,
      getScript: async () => [
        {
          id: "1",
          selectedScriptIndex: 0,
          scriptTexts: ["This is a test script", "This is a test script 2"],
          sectionName: "Section 1",
          scriptMedia: {url: "image1.jpg", author: "matthew"},
          scriptDuration: 5,
        },
        // Add more sections as needed
      ],
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <ScriptEditor />
        </MemoryRouter>
      )
    );
    const viewOtherDraftsButton = screen.getAllByTestId("add-draft")[0];
    expect(viewOtherDraftsButton).toBeInTheDocument();

    act(() => {
      viewOtherDraftsButton.click();
    });

  });

  it("should handle deleting current script", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      getProjectHasSoundEffect: async () => false,
      setScript: vi.fn().mockResolvedValue({}),
      getScript: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: "1",
            selectedScriptIndex: 0,
            scriptTexts: [""],
            sectionName: "Section 1",
            scriptMedia: {url: "image1.jpg", author: "matthew"},
            imagePrompts: [{ prompt: "A prompt", unsplashedImages: [{url: "example.com" ,author: "matthew"}] }],
            scriptDuration: 5,
          },
          {
            id: "2",
            scriptMedia: {url: "image2.jpg", author: "matthew"},
            scriptDuration: 10,
            sectionName: "Section 2",
            selectedScriptIndex: 0,
            imagePrompts: [{ prompt: "A prompt", unsplashedImages: [{url: "example.com" ,author: "matthew"}] }],
            scriptTexts: [""],
          },
          // Add more sections as needed
        ])
        .mockResolvedValueOnce([
          {
            id: "2",
            scriptMedia: {url: "image2.jpg", author: "matthew"},
            scriptDuration: 10,
            sectionName: "Section 2",
            selectedScriptIndex: 0,
            imagePrompts: [{ prompt: "A prompt", unsplashedImages: [{url: "example.com" ,author: "matthew"}] }],
            scriptTexts: [""],
          },
          // Add more sections as needed
        ]),
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <ScriptEditor />
        </MemoryRouter>
      )
    );

    const sections = screen.getAllByRole("list")[0];
    expect(sections.childNodes).toHaveLength(2);
    const deleteButton = screen.queryAllByTestId("delete-script")[0];
    expect(deleteButton).toBeInTheDocument();

    act(() => {
      screen.getByText("Section 1").click();
      deleteButton.click();
    });

    expect(window.api.setScript).toHaveBeenCalledTimes(1);
  });
  it("should handle selecting a script", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      setScript: vi.fn().mockResolvedValue({}),
      getProjectTopic: vi.fn().mockResolvedValue(topics[0]),
      getProjectHasSoundEffect: async () => false,
      getScript: async () => [
        {
          id: "1",
          selectedScriptIndex: 0,
          scriptTexts: [""],
          sectionName: "Section 1",
          scriptMedia: {url: "image1.jpg", author: "matthew"},
          scriptDuration: 5,
        },
        {
          id: "2",
          scriptMedia: {url: "image2.jpg", author: "matthew"},
          scriptDuration: 10,
          sectionName: "Section 2",
          selectedScriptIndex: 0,
          scriptTexts: [""],
        },
        // Add more sections as needed
      ],
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <ScriptEditor />
        </MemoryRouter>
      )
    );

    const script1 = screen.getByText("Section 1");
    const script2 = screen.getByText("Section 2");

    expect(script1).toBeInTheDocument();
    expect(script2).toBeInTheDocument();

    act(() => {
      script1.click();
    });
    const selectedSection = screen
      .getAllByRole("list")[0]
      .querySelector(".border-sky-500.border-2");
    expect(selectedSection).toBeInTheDocument();

    act(() => {
      script2.click();
    });

    const selectedSection2 = screen
      .getAllByRole("list")[0]
      .querySelector(".border-sky-500.border-2");

    expect(selectedSection2).toBeInTheDocument();
  });
});
