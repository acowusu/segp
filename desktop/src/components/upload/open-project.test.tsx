import { render, screen, fireEvent } from "../../lib/test-utils";
import { OpenProject } from "./open-project";

describe("OpenProject", () => {
  test("renders the form with input fields", () => {
    render(<OpenProject />);
    
    expect(screen.getByLabelText("Project Directory")).toBeInTheDocument();
  });



  test("tries to open dialog when project dir clicked", () => {
    const setProjectFileMock = vi.fn();

    render(<OpenProject setProjectFile={setProjectFileMock} />);
    screen.logTestingPlaygroundURL();
    const nameInput = screen.getByRole('textbox', { name: /project directory/i })

    fireEvent.click(nameInput)
    expect(setProjectFileMock).toHaveBeenCalled();

  });


  test("calls handleNext function when Next button is clicked", () => {
    const handleNextMock = vi.fn();
    render(<OpenProject handleNext={handleNextMock} />);
    
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    
    expect(handleNextMock).toHaveBeenCalled();
  });
});