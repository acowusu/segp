import { render, screen } from "@testing-library/react";
import { NotFound } from "./not-found";
import { MemoryRouter } from "react-router-dom";

describe("NotFound", () => {
  it("should render the 404 message and link", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Go back to home")).toBeInTheDocument();
  });
});