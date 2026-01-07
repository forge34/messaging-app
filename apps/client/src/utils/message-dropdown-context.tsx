import { createContext, useContext, useState } from "react";
import { MessageDropdownState } from "../components/message-dropdown";
import { MessageSchema } from "./schema";

interface MessageDropdownContextType {
  dropdownState: MessageDropdownState;
  openDropdown: (
    message: MessageSchema,
    conversationId:string,
    position: { x: number; y: number },
  ) => void;
  closeDropdown: () => void;
}

const MessageDropdownContext = createContext<MessageDropdownContextType | null>(
  null,
);

export function MessageDropdownProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [dropdown, setDropdown] = useState<MessageDropdownState>({
    isOpen: false,
    message: null,
    position: { x: 0, y: 0 },
    conversationId:""
  });

  const openDropdown = (
    message: MessageSchema,
    conversationId:string,
    position: { x: number; y: number },
  ) => {
    setDropdown({ isOpen: true, message: message, position,conversationId });
  };

  const closeDropdown = () => {
    setDropdown({ isOpen: false, message: null, position: { x: 0, y: 0 },conversationId:"" });
  };

  return (
    <MessageDropdownContext.Provider
      value={{ dropdownState: dropdown, openDropdown, closeDropdown }}
    >
      {children}
    </MessageDropdownContext.Provider>
  );
}

export function useDropdown() {
  if (!MessageDropdownContext) {
    throw new Error("MessageDropdownContext must be used within its provider");
  }

  return useContext(MessageDropdownContext);
}
