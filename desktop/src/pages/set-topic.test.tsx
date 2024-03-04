import { act, render, screen } from "@testing-library/react";
import { SetTopic } from "./set-topic";
import { MemoryRouter } from "react-router-dom";
import { mockApi } from "../lib/test-api";
import { vi } from "vitest";
import mockTopics from "../../electron/mockData/topics.json";
vi.stubGlobal("api", {});

describe("ScriptEditor", () => {

  it("should render the Title", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getTopics: async () => mockTopics,
      getProjectTopic: async () => mockTopics[0],
      setTopic: async () => {},
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <SetTopic />
        </MemoryRouter>
      )
    );

    expect(screen.getByText("Select Topic")).toBeInTheDocument();
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });
});
