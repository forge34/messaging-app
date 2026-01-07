import { render, screen } from "@testing-library/react";
import Message, { MessageProps } from "../components/message";
import { ConversationSchema, MessageSchema, UserSchema } from "../utils/schema";

const testUser: UserSchema = {
  pk: 1,
  id: "cm0xul6bz000109mb8i2t3j1m",
  name: "Test User",
  imgUrl: "url.com",
  conversations: [] as ConversationSchema[],
  messages: [] as MessageSchema[],
  relatedToCurrent: false,
};

const testMessage: MessageProps = {
  author: testUser,
  body: "Hello",
  ownMessage: true,
  id: "cm0xulkra000209mb6b6nbwp1",
};

describe("message component test", () => {
  test("should match snapshot", () => {
    const { container } = render(<Message {...testMessage}></Message>);

    expect(container).toMatchSnapshot();
  });

  test("should render correct message text", () => {
    render(<Message {...testMessage}></Message>);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
