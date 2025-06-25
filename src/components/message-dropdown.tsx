import { useDropdown } from "../utils/message-dropdown-context";
import { MessageSchema } from "../utils/schema";
import styles from "../styles/message-dropdown.module.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useClickOutside from "../utils/hooks/use-click-outside";
import { motion } from "motion/react";

export interface MessageDropdownState {
  isOpen: boolean;
  position: { x: number; y: number };
  message: MessageSchema | null;
  conversationId: string;
  children?: React.ReactNode;
}

function MessageDropdown({ children }: { children?: React.ReactNode }) {
  const context = useDropdown();
  const dropdownState = context?.dropdownState;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adjustPostioned, setAdjustedPostion] = useState({ x: 0, y: 0 });

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
  }, [context, dropdownState, dropdownRef]);

  useLayoutEffect(() => {
    const dropdown = dropdownRef.current;

    if (!dropdown || !dropdownState?.isOpen) return;

    const { innerWidth } = window;
    const rect = dropdown.getBoundingClientRect();
    let left = dropdownState.position.x;
    let top = dropdownState.position.y;
    console.log(rect)

    if (left + rect.width >= innerWidth + rect.width / 2) {
      left -= 20;
    }

    if (top - rect.height < 150) {
      top += rect.height + 20;
    }

    setAdjustedPostion({
      x: left,
      y: top,
    });
  }, [dropdownState?.isOpen, dropdownState?.position, context]);

  return (
    <>
      {dropdownState?.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          ref={dropdownRef}
          className={styles.dropdownContainer}
          style={{
            left: adjustPostioned.x,
            top: adjustPostioned.y,
          }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export default MessageDropdown;
