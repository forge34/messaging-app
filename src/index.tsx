// import SidebarItem from "./components/sidebar-item";
import Sidebar from "./components/sidebar";
import SidebarItem from "./components/sidebar-item";
import messageIcon from "./assets/message.svg";
import starIcon from "./assets/star.svg";
import settingsIcon from "./assets/settings.svg";
import profileIcon from "./assets/user.svg";
import Chatarea from "./pages/chat-area";
// import {   useState } from "react";

function App() {
  // const [selected, setSetlected] = useState(0);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {}
  return (
    <>
      <Sidebar handleClick={handleClick}>
        <h1>MA</h1>
        <SidebarItem imgSrc={messageIcon} itemtext="All messages"></SidebarItem>
        <SidebarItem imgSrc={starIcon} itemtext="Starred"></SidebarItem>
        <SidebarItem imgSrc={profileIcon} itemtext="Profle"></SidebarItem>
        <SidebarItem imgSrc={settingsIcon} itemtext="Settings"></SidebarItem>
      </Sidebar>
      <Chatarea></Chatarea>
    </>
  );
}

export default App;
