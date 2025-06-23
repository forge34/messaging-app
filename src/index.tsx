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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  bookmarkMessage,
  deleteMessage,
  getCurrentUser,
} from "./utils/queries";
import { Puff } from "react-loader-spinner";
import { useDropdown } from "./utils/message-dropdown-context";
import MessageDropdown from "./components/message-dropdown.tsx";
import MessageDropdownBtn from "./components/message-dropdown-btn.tsx";
import deleteIcon from "./assets/trash.svg";
import bookmarkIcon from "./assets/star.svg";

function App() {
  const { isLoading, isSuccess, data: user } = useQuery(getCurrentUser());
  const context = useDropdown();
  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    retry: false,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["conversations", context!.dropdownState!.conversationId],
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: bookmarkMessage,
    retry: false,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["bookmarks"],
      });
    },
  });

  const message = context?.dropdownState.message;

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
        width={181}
        height={181}
        color="#4968d0"
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
        <SidebarItem imgSrc={starIcon} itemtext="Bookmarked" to="bookmarks" />
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
      <MessageDropdown>
        <MessageDropdownBtn text="Message info" iconSrc={infoIcon} />
        <MessageDropdownBtn
          text="Bookmark"
          iconSrc={bookmarkIcon}
          extraClass="bookmark-icon"
          onClick={async () => {
            await bookmarkMutation.mutateAsync(message!.id);
            context?.closeDropdown();
          }}
        />

        {message?.author.id === user?.id && (
          <MessageDropdownBtn
            text="Delete"
            iconSrc={deleteIcon}
            extraClass="dropdown-delete"
            onClick={async () => {
              console.log("clicked");
              await deleteMutation.mutateAsync(message!.id);
              context?.closeDropdown();
            }}
          />
        )}
      </MessageDropdown>
    </>
  );
}

export default App;
