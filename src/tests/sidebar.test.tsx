import { render, screen } from "@testing-library/react";
import Sidebar from "../components/sidebar";
import SidebarItem from "../components/sidebar-item";
import { MemoryRouter } from "react-router-dom";

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
      <MemoryRouter>
        <Sidebar>
          <SidebarItem to="" itemtext="Item 1" imgSrc="some/src"></SidebarItem>
        </Sidebar>
      </MemoryRouter>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
