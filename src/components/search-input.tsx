import searchIcon from "../assets/search.svg";

export default function SearchInput() {
  return (
    <div className="search-input">
      <img width={32} height={32} src={searchIcon} />
      <input type="search" placeholder="Search ..." />
    </div>
  );
}
