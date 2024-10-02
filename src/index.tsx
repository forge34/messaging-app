import Sidebar from "./components/sidebar";
import SidebarItem from "./components/sidebar-item";
import messageIcon from "./assets/message.svg";
import starIcon from "./assets/star.svg";
import settingsIcon from "./assets/settings.svg";
import profileIcon from "./assets/user.svg";
import usersIcon from "./assets/users.svg";
import logOutIcon from "./assets/log-out.svg";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./utils/socket";
import { queryClient } from "./router";
import toast from "react-hot-toast";
import infoIcon from "./assets/info.svg";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "./utils/queries";
import { Puff } from "react-loader-spinner";

function App() {
  const { isLoading, isSuccess } = useQuery(getCurrentUser());
  useEffect(() => {
    function onMessage({
      author,
      content,
    }: {
      author: string;
      content: string;
    }) {
      toast(
        <div className="notification">
          <img src={infoIcon} width={32} height={32} />
          <span>
            <h3>{author}</h3>
            <p>{content}</p>
          </span>
        </div>,
        {
          duration: 1500,
          style: {
            backgroundColor: "#313338",
            color: "white",
          },
        },
      );
      queryClient.invalidateQueries();
    }

    if (isSuccess) {
      if (!socket.connect()) socket.connect();
      socket.on("message:create", onMessage);
    }

    return () => {
      socket.off("message:create", onMessage);
    };
  }, [isSuccess]);

  if (isLoading) {
    return (
      <Puff
        width={180}
        height={180}
        color="#4967d0"
        wrapperClass="spinner"
      ></Puff>
    );
  }

  return (
    <>
      <Sidebar>
        <SidebarItem
          imgSrc={messageIcon}
          itemtext="All messages"
          to="conversations"
        />
        <SidebarItem imgSrc={starIcon} itemtext="Starred" to="starred" />
        <SidebarItem imgSrc={profileIcon} itemtext="Profle" to="profile" />
        <SidebarItem imgSrc={usersIcon} itemtext="people" to="people" />
        <SidebarItem
          imgSrc={logOutIcon}
          itemtext="Logout"
          to="logout"
          className="logout-icon"
        />
        <SidebarItem imgSrc={settingsIcon} itemtext="Settings" to="settings" />
      </Sidebar>
      <Outlet />
    </>
  );
}

export default App;
