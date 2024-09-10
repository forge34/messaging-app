import { render, screen } from "@testing-library/react";
import SidebarItem from "../components/sidebar-item";
import { MemoryRouter } from "react-router-dom";

describe("sidebar item test suite", () => {
  test("should be in the document", () => {
    render(
      <MemoryRouter>
        <SidebarItem
          to={""}
          imgSrc="/some/path"
          itemtext="All messages"
        ></SidebarItem>
      </MemoryRouter>,
    );

    expect(screen.getByText("All messages")).toBeInTheDocument();
  });
});
