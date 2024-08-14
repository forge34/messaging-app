// import SidebarItem from "./components/sidebar-item";
import Sidebar from "./components/sidebar";
import SidebarItem from "./components/sidebar-item";
import messageIcon from "./assets/message.svg";
import starIcon from "./assets/star.svg";
import settingsIcon from "./assets/settings.svg";
import profileIcon from "./assets/user.svg";
import usersIcon from "./assets/users.svg";
import { Outlet } from "react-router-dom";
// import {   useState } from "react";

function App() {
  // const [selected, setSetlected] = useState(0);

  return (
    <>
      <Sidebar>
        <h1>MA</h1>
        <SidebarItem
          imgSrc={messageIcon}
          itemtext="All messages"
          to="conversations"
        ></SidebarItem>
        <SidebarItem
          imgSrc={starIcon}
          itemtext="Starred"
          to="starred"
        ></SidebarItem>
        <SidebarItem
          imgSrc={profileIcon}
          itemtext="Profle"
          to="profile"
        ></SidebarItem>
        <SidebarItem
          imgSrc={usersIcon}
          itemtext="people"
          to="people"
        ></SidebarItem>
        <SidebarItem
          imgSrc={settingsIcon}
          itemtext="Settings"
          to="settings"
        ></SidebarItem>
      </Sidebar>
      <Outlet></Outlet>
    </>
  );
}

export default App;
