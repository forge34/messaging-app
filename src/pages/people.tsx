import { useQuery } from "@tanstack/react-query";
import SearchInput from "../components/search-input";
import "../styles/css/people-area.css";
import { getUsers } from "../utils/queries";
import UserCard from "../components/user-card";
import { randomIp } from "../utils/functions";
import { User } from "../utils/schema";

export default function People() {
  const { data } = useQuery(getUsers());

  return (
    <div className="people-section">
      <h1>Find or start a conversation</h1>
      <SearchInput></SearchInput>
      <div className="user-card-container">
        {data?.map((user: User) => {
          return (
            <UserCard
              userId={user.id}
              imgSrc={randomIp()}
              username={user.name}
              key={user.id}
              isRelated={user.relatedToCurrent}
              conversation={user.privateConversation}
            ></UserCard>
          );
        })}
      </div>
    </div>
  );
}
