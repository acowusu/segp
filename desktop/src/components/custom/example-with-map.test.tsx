import { render, screen, userEvent } from "../../lib/test-utils";
import { ExampleWithMap } from "./example-with-map";
import "@testing-library/jest-dom";

describe("Input", async () => {
  it("should render the input", () => {
    render(<ExampleWithMap />);
    expect(screen.getByText("Add File 1")).toBeInTheDocument();
    expect(screen.getByText("Add File 2")).toBeInTheDocument();

  });

  it("should add a item", async () => {
    render(
      <ExampleWithMap />
    );
    const input = screen.getByText("Add File 1");
    expect(input).toBeInTheDocument();
    await userEvent.click(input);
    const item = screen.getByRole('listitem')
    expect(item).toBeInTheDocument()
    const deleteFileButton  = screen.getByText("Remove File 1");
    expect(deleteFileButton).toBeInTheDocument();
    await userEvent.click(deleteFileButton)
    // screen.logTestingPlaygroundURL();
    expect(screen.queryByText('content')).toBeNull()
  });

  
});
