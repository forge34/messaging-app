import { useQuery } from "@tanstack/react-query";
import styles from "../styles/people-section.module.css";
import SearchInput from "../components/search-input";
import { getCurrentUser, getUsers } from "../utils/queries";
import UserCard from "../components/user-card";
import { UserSchema } from "../utils/schema";

export default function People() {
  const { data } = useQuery(getUsers());
  const { data: currentUser } = useQuery(getCurrentUser());

  return (
    <div className={styles.peopleSection}>
      <h1>Find or start a conversation</h1>
      <SearchInput/>
      <div className={styles.userCardContainer}>
        {data?.map((user: UserSchema) => {
          if (user.id === currentUser?.id) return null;
          return (
            <UserCard
              userId={user.id}
              imgSrc={user.imgUrl}
              username={user.name}
              key={user.id}
              isCurrent={user.isCurrent}
              conversationId={user.conversationId}
            ></UserCard>
          );
        })}
      </div>
    </div>
  );
}
