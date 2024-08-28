import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../utils/queries";
import "../styles/css/profile.css";

export default function Profile() {
  const { data: user } = useQuery(getCurrentUser());

  return (
    <div className="profile-section">
      <img src={user?.imgUrl} width={300} height={300} />

      <div className="profile-info">
        <div className="info-row">
          <h1>Username</h1>
          <h2>{user?.name}</h2>
        </div>
        <div className="info-row">
          <h1>Message count</h1>
          <h2>{user?.messages.length}</h2>
        </div>
      </div>

      <button className="btn-edit">Edit profile</button>
    </div>
  );
}
