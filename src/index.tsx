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
import infoIcon from "./assets/info.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  bookmarkMessage,
  deleteMessage,
  getCurrentUser,
} from "./utils/queries";
import { useDropdown } from "./utils/message-dropdown-context";
import MessageDropdown from "./components/message-dropdown.tsx";
import MessageDropdownBtn from "./components/message-dropdown-btn.tsx";
import deleteIcon from "./assets/trash.svg";
import bookmarkIcon from "./assets/star.svg";
import { onMessageCreate } from "./utils/socket-handlers.tsx";

function App() {
  const { isSuccess, data: user } = useQuery(getCurrentUser());
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

  const dropwonMessage = context?.dropdownState.message;

  useEffect(() => {
    if (isSuccess) {
      if (!socket.connected) socket.connect();

      socket.on("message:create", onMessageCreate);
    }

    return () => {
      socket.off("message:create", onMessageCreate);
    };
  }, [isSuccess]);

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
            await bookmarkMutation.mutateAsync(dropwonMessage!.id);
            context?.closeDropdown();
          }}
        />

        {dropwonMessage?.author.id === user?.id && (
          <MessageDropdownBtn
            text="Delete"
            iconSrc={deleteIcon}
            extraClass="dropdown-delete"
            onClick={async () => {
              console.log("clicked");
              await deleteMutation.mutateAsync(dropwonMessage!.id);
              context?.closeDropdown();
            }}
          />
        )}
      </MessageDropdown>
    </>
  );
}

export default App;
