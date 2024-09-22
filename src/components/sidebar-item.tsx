import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

interface sidebarItemProps {
  imgSrc: string;
  itemtext: string;
  to: string;
}

export default function SidebarItem(props: sidebarItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const contains = location.pathname.includes(`${props.to}`);

  const selected = contains ? "selected" : "";

  return (
    <div
      className={"sidebar-item " + selected}
      onClick={() => {
        if (props.to === "starred" || props.to === "settings") {
          toast.error("for decoration purposes only");
        } else navigate(`${props.to}`);
      }}
    >
      <img src={props.imgSrc}  />
      <p>{props.itemtext}</p>
    </div>
  );
}
