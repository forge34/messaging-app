import { useDropdown } from "../utils/message-dropdown-context";
import { MessageSchema } from "../utils/schema";
import styles from "../styles/message-dropdown.module.css";
import { useEffect, useLayoutEffect, useRef } from "react";
import useClickOutside from "../utils/hooks/use-click-outside";

export interface MessageDropdownState {
  isOpen: boolean;
  position: { x: number; y: number };
  message: MessageSchema | null;
  conversationId:string
  children?: React.ReactNode;
}

function MessageDropdown({ children }: { children?: React.ReactNode }) {
  const context = useDropdown();
  const dropdownState = context?.dropdownState;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    context?.closeDropdown();
  });

  useEffect(() => {
    const dropdown = dropdownRef.current;

    if (!dropdown || !dropdownState?.isOpen) return;

    function closeOnScroll() {
      context?.closeDropdown();
    }

    document.addEventListener("scroll", closeOnScroll, true);

    return () => {
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [context , dropdownState , dropdownRef]);

  useLayoutEffect(() => {
    const dropdown = dropdownRef.current;

    if (!dropdown || !dropdownState?.isOpen) return;

    const { innerWidth } = window;
    const rect = dropdown.getBoundingClientRect();
    let left = dropdownState.position.x;
    let top = dropdownState.position.y;

    if (left + rect.width >= innerWidth + rect.width / 2) {
      left -= 20;
    }

    if (top - rect.height < 150) {
      top += rect.height + 20;
    }

    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }, [dropdownState?.isOpen, dropdownState?.position, context]);

  return (
    <>
      {dropdownState?.isOpen && (
        < div
          ref={dropdownRef}
          className={styles.dropdownContainer}
          style={{
            top: dropdownState.position.y,
            left: dropdownState.position.x,
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}

export default MessageDropdown;
