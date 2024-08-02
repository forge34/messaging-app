import "../styles/css/chat-area.css";
import searchIcon from "../assets/search.svg";

export default function Chatarea() {
  return (
    <div className="chat-area">
      <h1>Chats</h1>
      <div className="search-input">
        <img width={32} height={32} src={searchIcon} />
        <input type="search" placeholder="Search conversations..." />
      </div>
    </div>
  );
}
