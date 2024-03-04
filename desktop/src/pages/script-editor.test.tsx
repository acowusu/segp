import { act, render, screen } from "@testing-library/react";
import { ScriptEditor } from "./script-editor";
import { MemoryRouter } from "react-router-dom";
import { mockApi } from "../lib/test-api";
import { vi } from "vitest";

vi.stubGlobal("api", {});

describe("ScriptEditor", () => {
  //   beforeEach(() => {
  //     window.api = mockApi;
  //   });

  it("should render the Title", async () => {
    vi.spyOn(window, "api", "get").mockReturnValue({ ...mockApi });
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
