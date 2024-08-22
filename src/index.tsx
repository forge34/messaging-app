import Sidebar from "./components/sidebar";
import SidebarItem from "./components/sidebar-item";
import messageIcon from "./assets/message.svg";
import starIcon from "./assets/star.svg";
import settingsIcon from "./assets/settings.svg";
import profileIcon from "./assets/user.svg";
import usersIcon from "./assets/users.svg";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./utils/socket";
import { queryClient } from "./router";

function App() {
  useEffect(() => {
    if (!socket.connect()) socket.connect();

   
    function onMessage() {
      queryClient.invalidateQueries();
    }

    socket.on("message:create", onMessage);

    return () => {
      socket.off("message:create", onMessage);
    };
  }, []);

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
