import { useQuery } from "@tanstack/react-query";
import styles from "../styles/bookmarks.module.css";
import { getBookmarks } from "../utils/queries";
import arrowRight from "../assets/arrow-right.svg";
import { getTime } from "../utils/functions";

function Bookmarks() {
  const { data: bookmarks } = useQuery(getBookmarks());

  return (
    <div className={styles.container}>
      <h3>Bookmarked messages </h3>
      {bookmarks?.map((bookmark) => {
        return (
          <div className={styles.bookmarkContainer} key={bookmark.id}>
            <img src={bookmark.author.imgUrl}  />
            <div className={styles.bookmarkContent}>
              <span>
                {bookmark.author.name}
                <img src={arrowRight} />
              </span>

              <p>{bookmark.body}</p>
              <p style={{ marginLeft: "auto" }} className="timestamp">
                {" "}
                {getTime(bookmark.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Bookmarks;
