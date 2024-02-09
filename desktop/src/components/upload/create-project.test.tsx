import { render, screen, fireEvent } from "../../lib/test-utils";
import { CreateProject } from "./create-project";

describe("CreateProject", () => {
  test("renders the form with input fields", () => {
    render(<CreateProject />);
    
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Project Directory")).toBeInTheDocument();
    expect(screen.getByLabelText("Report PDF")).toBeInTheDocument();
  });



  test("tries to open dialog when project dir clicked", () => {
    const setProjectFileMock = vi.fn();

    render(<CreateProject setProjectFile={setProjectFileMock} />);
    screen.logTestingPlaygroundURL();
    const nameInput = screen.getByRole('textbox', { name: /project directory report pdf/i })
    fireEvent.click(nameInput)
    expect(setProjectFileMock).toHaveBeenCalled();

  });


  test("calls handleNext function when Next button is clicked", () => {
    const handleNextMock = vi.fn();
    render(<CreateProject handleNext={handleNextMock} />);
    
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    
    expect(handleNextMock).toHaveBeenCalled();
  });
});