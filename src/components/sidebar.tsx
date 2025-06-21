import "../styles/sidebar.css";
import { ReactNode } from "react";

function Sidebar({
  children,
  handleClick,
}: {
  children: ReactNode | Array<ReactNode>;
  handleClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <nav onClick={handleClick} className="sidebar">
      {children}
    </nav>
  );
}

export default Sidebar;
