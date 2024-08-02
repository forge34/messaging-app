import { render, screen } from "@testing-library/react";
import SidebarItem from "../components/sidebar-item";

describe("sidebar item test suite", () => {
  test("should be in the document", () => {
    render(
      <SidebarItem imgSrc="/some/path" itemtext="All messages"></SidebarItem>,
    );

    expect(screen.getByText("All messages")).toBeInTheDocument();
  });
});
