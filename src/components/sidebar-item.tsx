import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useMatchMedia } from "../utils/hooks/use-match-media";
import { useState } from "react";

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
  className = "",
}: sidebarItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const contains = location.pathname.includes(`${to}`);
  const { matches } = useMatchMedia("(max-width: 768px)");
  const [hovered, setHovered] = useState(false);

  const selected = contains ? "selected " : "";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={"sidebar-item " + selected + className}
      onClick={() => {
        if (to === "starred" || to === "settings") {
          toast.error("for decoration purposes only");
        } else navigate(`${to}`);
      }}
    >
      <img src={imgSrc} />
      {matches && <p>{itemtext}</p>}
      {!matches && hovered && (
        <span className="tooltip">
          <p>{itemtext}</p>
        </span>
      )}
    </div>
  );
}
