import { useState, useRef, useEffect } from "react";
import { FiSearch, FiX, FiBell } from "react-icons/fi";
import { useSelector } from "react-redux";
import NotificationDialog from "./NotificationDialog";
import { Link } from "react-router-dom";

export default function TopBar({ onSearchResults }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const { users } = useSelector((state) => state.auth); // all users
  const { posts } = useSelector((state) => state.post); // all posts
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  // Focus input when opened
  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  // Filter function for global search
  useEffect(() => {
    if (!searchText.trim()) {
      setResults([]);
      onSearchResults?.([]);
      return;
    }

    const lowerText = searchText.toLowerCase();

    // Filter users
    const matchedUsers = users?.filter((u) =>
      u.username.toLowerCase().includes(lowerText)
    );

    // Filter posts
    const matchedPosts = posts?.filter((p) =>
      p.caption.toLowerCase().includes(lowerText)
    );

    const combined = [...(matchedUsers || []), ...(matchedPosts || [])];
    setResults(combined);
    onSearchResults?.(combined);
  }, [searchText, users, posts, onSearchResults]);

  const handleSearchChange = (e) => setSearchText(e.target.value);

  const handleClear = () => {
    setSearchText("");
    inputRef.current?.focus();
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 backdrop-blur-md bg-transparent shadow-lg fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <Link to={"/"}>
        <div className="text-2xl font-extrabold text-[#FBCE26]">Linkly</div>
      </Link>

      {/* Search Section */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search users or posts..."
          className={`transition-all duration-300 border rounded-full text-black px-4 py-1 outline-none bg-white/70 backdrop-blur-sm shadow-sm text-sm ${
            showSearch ? "w-64 opacity-100 ml-2" : "w-0 opacity-0 ml-0"
          }`}
        />
        <button
          onClick={() => setShowSearch((prev) => !prev)}
          className="ml-2 text-xl text-gray-700 hover:text-gray-900 transition-colors"
        >
          {showSearch ? (
            <FiX className="text-[#FBCE26]" />
          ) : (
            <FiSearch className="text-[#FBCE26]" />
          )}
        </button>
        {showSearch && searchText && (
          <button
            onClick={handleClear}
            className="absolute right-10 text-gray-500 text-xs hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4 text-gray-700">
        {/* Notification */}
        <button className="relative">
          <FiBell
            onClick={() => {
              setOpen(true);
            }}
            size={20}
            className="text-[#FBCE26]"
          />
          {likeNotification?.length > 0 && (
            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
              {likeNotification?.length}
            </span>
          )}
        </button>
        <NotificationDialog
          open={open}
          setOpen={setOpen}
          likeNotification={likeNotification}
        />
        {/* You can add more icons here */}
      </div>
    </div>
  );
}
