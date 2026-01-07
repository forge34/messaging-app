import { render, screen } from "@testing-library/react";
import TextInput from "../components/text-input";
import userEvent from "@testing-library/user-event";

describe("text input test suite", () => {
  test("should match snapshot", () => {
    const { container } = render(
      <TextInput name="username" label="Username"></TextInput>,
    );

    expect(container).toMatchSnapshot();
  });
  test("should render label correctly", () => {
    render(<TextInput name="username" label="Username"></TextInput>);

    expect(screen.getByText("Username".toUpperCase())).toBeInTheDocument();
  });

  test("should render input", () => {
    render(<TextInput name="username" label="Username"></TextInput>);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("should change input value on typing", async () => {
    const user = userEvent.setup();
    render(<TextInput name="username" label="Username"></TextInput>);

    const input = screen.getByRole<HTMLInputElement>("textbox");
    await user.type(input, "Forge");

    expect(input.value).toMatch("Forge");
  });

  test("should focus input on click", async () => {
    const user = userEvent.setup();
    render(<TextInput name="username" label="Username"></TextInput>);

    const input = screen.getByRole<HTMLInputElement>("textbox");
    await user.click(input);

    expect(input).toHaveFocus();
  });
});
