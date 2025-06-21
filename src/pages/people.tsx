import { useQuery } from "@tanstack/react-query";
import SearchInput from "../components/search-input";
import "../styles/people-section.css";
import { getCurrentUser, getUsers } from "../utils/queries";
import UserCard from "../components/user-card";
import { UserSchema } from "../utils/schema";

export default function People() {
  const { data } = useQuery(getUsers());
  const {data :currentUser} = useQuery(getCurrentUser())

  return (
    <div className="people-section">
      <h1>Find or start a conversation</h1>
      <SearchInput/>
      <div className="user-card-container">
        {data?.map((user: UserSchema) => {
          if (user.id === currentUser?.id) return null
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
