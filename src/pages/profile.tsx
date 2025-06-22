import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../utils/queries";
import styles from "../styles/profile.module.css";

export default function Profile() {
  const { data: user } = useQuery(getCurrentUser());
  return (
    <div className={styles.profileSection}>
      <img src={user?.imgUrl} alt="user avatar" />

      <div className={styles.profileInfo}>
        <div className={styles.infoRow}>
          <h2>Username</h2>
          <h3>{user?.name}</h3>
        </div>
        <div className={styles.infoRow}>
          <h2>Message count</h2>
          <h3>{user?.messages.length}</h3>
        </div>
      </div>

      <button className={styles.btnEdit}>Edit profile</button>
    </div>
  );
}
