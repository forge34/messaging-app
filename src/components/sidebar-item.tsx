import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useMatchMedia } from "../hooks/use-match-media";
import { useState } from "react";
import styles from "../styles/sidebar.module.css";

interface sidebarItemProps {
  imgSrc: string;
  itemtext: string;
  to: string;
  className?: string;
}

export default function SidebarItem({
  imgSrc,
  to,
  itemtext,
  className = " ",
}: sidebarItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const contains = location.pathname.includes(`${to}`);
  const { matches } = useMatchMedia("(max-width: 768px)");
  const [hovered, setHovered] = useState(false);


  return (
    <section
      aria-current={contains ? "page" : "false"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={styles.sidebarItem + ` ${className}`}
      data-selected={contains}
      onClick={() => {
        if ( to === "settings") {
          toast.error("for decoration purposes only");
        } else navigate(`${to}`);
      }}
    >
      <img src={imgSrc} alt={`${to} navigation icon`} />
      {matches && <p>{itemtext}</p>}
      {!matches && hovered && (
        <span className={styles.tooltip}>
          <p>{itemtext}</p>
        </span>
      )}
    </section>
  );
}
