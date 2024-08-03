import "../styles/css/chat-area.css";
import searchIcon from "../assets/search.svg";
import ChatCard from "../components/chat-card";

const randomIp = () =>
  Math.floor(Math.random() * 255) +
  1 +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255) +
  "." +
  Math.floor(Math.random() * 255);
const dummyData = [
  {
    name: "Rahim Pratt",
    text: "turpis non enim.",
    time: "9:02 AM",
  },
  {
    name: "Richard Sampson",
    text: "ut mi. Duis",
    time: "1:57 AM",
  },
  {
    name: "Francis Moon",
    text: "Proin non massa",
    time: "6:44 PM",
  },
  {
    name: "Nehru Park",
    text: "magna tellus faucibus",
    time: "6:57 PM",
  },
  {
    name: "Kirestin Wiley",
    text: "dictum magna. Ut",
    time: "8:02 PM",
  },
  {
    name: "Anika Lawson",
    text: "Suspendisse non leo.",
    time: "5:02 AM",
  },
  {
    name: "Malachi Emerson",
    text: "lobortis. Class aptent",
    time: "9:44 PM",
  },
  {
    name: "Destiny Small",
    text: "vitae, sodales at,",
    time: "9:53 AM",
  },
  {
    name: "Benedict Myers",
    text: "in, dolor. Fusce",
    time: "10:19 AM",
  },
  {
    name: "Wing Miranda",
    text: "conubia nostra, per",
    time: "2:40 AM",
  },
];

export default function Chatarea() {
  return (
    <div className="chat-area">
      <div>
        <h1>Chats</h1>
        <div className="search-input">
          <img width={32} height={32} src={searchIcon} />
          <input type="search" placeholder="Search conversations..." />
        </div>

        {dummyData.map((data) => {
          return (
            <ChatCard
              userImg={`https://robohash.org/${randomIp()}`}
              userName={data.name}
              userLastMsg={data.text}
              userLastSent={data.time}
            ></ChatCard>
          );
        })}

        {/* <ChatCard */}
        {/*   userImg="https://avatar.iran.liara.run/public" */}
        {/*   userName="Forge Doc" */}
        {/*   userLastMsg="Hello there" */}
        {/* ></ChatCard> */}
      </div>
    </div>
  );
}
