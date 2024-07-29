import { render, screen } from "@testing-library/react";
import TextInput from "../components/text-input";

describe("text input test suite", () => {
  it("renders label correctly", () => {
    render(
      <TextInput name="username" label="Username" password={false}></TextInput>,
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  test("should render input", () => {
    render(
      <TextInput name="username" label="Username" password={false}></TextInput>,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
