import { render, screen } from "@testing-library/react";
import ChatCard from "../components/chat-card";
import { MemoryRouter } from "react-router-dom";

describe("chat card", () => {
  test("should render correct username", () => {
    render(
      <MemoryRouter>
        <ChatCard
          conversationTitle="forge"
          conversationLastMsg=""
          conversationImg="link"
          conversationId="cu123120asjdnao"
          conversationLastSent={new Date()}
        ></ChatCard>
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("heading")[0].textContent).toMatch("forge");
  });
});
