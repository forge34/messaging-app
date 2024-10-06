import searchIcon from "../assets/search.svg";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export default function SearchInput({
  searchTerm,
  setSearchTerm,
}: SearchInputProps) {
  function onChange(e: React.FormEvent<HTMLInputElement>) {
    setSearchTerm(e.currentTarget.value);
  }
  return (
    <div className="search-input">
      <img width={32} height={32} src={searchIcon} />
      <input
        type="search"
        placeholder="Search ..."
        value={searchTerm}
        onChange={onChange}
      />
    </div>
  );
}
