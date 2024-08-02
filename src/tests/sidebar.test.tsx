import { render, screen } from "@testing-library/react";
import Sidebar from "../components/sidebar";
import SidebarItem from "../components/sidebar-item";

describe("sidebar", () => {
  test("should render JSX children", () => {
    render(
      <Sidebar>
        <h1>App Title</h1>
      </Sidebar>,
    );

    expect(screen.getByRole("heading").textContent).toMatch("App Title");
  });

  test("should render react components", () => {
    render(
      <Sidebar>
        <SidebarItem itemtext="Item 1" imgSrc="some/src"></SidebarItem>
      </Sidebar>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
