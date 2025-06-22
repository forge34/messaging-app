import styles from "../styles/message-dropdown.module.css";

interface MessageDropdownBtnProps {
  text: string;
  iconSrc: string;
  onClick?: () => void;
  extraClass?: string;
}

function MessageDropdownBtn({
  text,
  onClick,
  iconSrc,
  extraClass,
}: MessageDropdownBtnProps) {
  return (
    <button className={styles.dropdownBtn + ` ${extraClass}`} onClick={onClick}>
      <span>{text}</span>

      <img src={iconSrc} width={20} height={20} />
    </button>
  );
}

export default MessageDropdownBtn;
