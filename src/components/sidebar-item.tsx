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
        navigate(`${props.to}`);
      }}
    >
      <img src={props.imgSrc} width={32} height={32} />
      <p>{props.itemtext}</p>
    </div>
  );
}
