// import SidebarItem from "./components/sidebar-item";
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
import toast, { Toaster } from "react-hot-toast";


function App() {
  useEffect(() => {
    socket.connect();
    socket.on("connection", () => {
      console.log("connected");
    });

    socket.on("create message", (id) => {
      
      console.log("Server says : message created");
      toast(`new message by  ${id}`)
      queryClient.invalidateQueries();
    });
  }, []);

  return (
    <>
      <Toaster></Toaster>
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
