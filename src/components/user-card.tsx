import "../styles/css/user-card.css";

interface UserCardProps {
  imgSrc: string;
  username: string;
  isRelated: boolean;
}

export default function UserCard(props: UserCardProps) {
  return (
    <div className="user-card">
      <img
        src={`https://robohash.org/${props.imgSrc}`}
        width={64}
        height={64}
      />
      <div>
        <h1 className="username">{props.username}</h1>
        <button className="user-card-btn">
          {props.isRelated ? "open conversation" : "start conversation"}
        </button>
      </div>
    </div>
  );
}
