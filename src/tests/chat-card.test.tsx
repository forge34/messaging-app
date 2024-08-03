import { render, screen } from "@testing-library/react";
import ChatCard from "../components/chat-card";

describe("chat card", () => {
  test("should render correct username", () => {
    render(
      <ChatCard
        userLastMsg="Hi there"
        userImg="some/link"
        userName="Forge Doc"
      ></ChatCard>,
    );

    expect(screen.getAllByRole("heading")[0].textContent).toMatch("Forge Doc")
  });
});
