import { act, render, screen } from "@testing-library/react";
import { Upload } from "./upload";
import { MemoryRouter } from "react-router-dom";
import { mockApi } from "../lib/test-api";
import { vi } from "vitest";
vi.stubGlobal("api", {});

describe("Upload", () => {
  it("should have options to create and open projects", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({
      ...mockApi,
      getLastProject: async () => "/path/to/project",
      getRecentProjects: async () => ["/path/to/project1", "/path/to/project2"],
    });
    await act(async () =>
      render(
        <MemoryRouter>
          <Upload />
        </MemoryRouter>
      )
    );

    expect(screen.getByText("Open Project")).toBeInTheDocument();
    expect(screen.getByText("New Project")).toBeInTheDocument();
  });
});
