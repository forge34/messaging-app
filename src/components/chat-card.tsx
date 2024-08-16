import "../styles/css/chat-card.css";

interface ChatCardProps {
  userImg: string;
  userName: string;
  userLastMsg: string;
  userLastSent?: string;
}

export default function ChatCard({
  userLastMsg,
  userImg,
  userLastSent = "Seconds ago...",
  userName,
}: ChatCardProps) {
  return (
    <div className="chat-card">
      <img width={48} height={48} src={userImg} />
      <div className="card-info">
        <h3>{userName}</h3>
        <p>{userLastMsg}</p>
      </div>
      <h5>{userLastSent}</h5>
    </div>
  );
}
