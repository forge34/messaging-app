import "../styles/css/sidebar.css";
import { ReactNode } from "react";

function Sidebar({
  children,
  handleClick,
}: {
  children: ReactNode | Array<ReactNode>;
  handleClick: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div onClick={handleClick} className="sidebar">
      {children}
    </div>
  );
}

export default Sidebar;
