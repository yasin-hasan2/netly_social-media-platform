import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "@/lib/axios";
import { setSelectedPost } from "@/redux/postSlice";
import {
  Search,
  X,
  Bell,
  Hash,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  Crown,
  Shield,
  CheckCircle2,
  Heart,
  MessageCircle,
  Film,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import NotificationDialog from "./NotificationDialog";
import CommentDialog from "./CommentDialog";
import BlueTagBadge from "./BlueTagBadge";

export default function TopBar({ onSearchResults }) {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'users' | 'posts' | 'hashtags'
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [] });
  const [trending, setTrending] = useState({ users: [], hashtags: [] });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    likeNotification = [],
    unreadNotificationCount = 0,
    unreadMessagesCount = 0,
  } = useSelector((store) => store.realTimeNotification);

  const SUPER_ADMIN_EMAILS = [
    "yasinalhasan@gmail.com",
    "yaseenalhassan2@gmail.com",
  ];
  const isSuperAdmin =
    user?.role === "super_admin" ||
    SUPER_ADMIN_EMAILS.includes((user?.email || "").toLowerCase());

  // 1. Load initial trending hashtags and suggested users on mount
  useEffect(() => {
    let isMounted = true;
    const loadTrending = async () => {
      try {
        const res = await axiosInstance.get("/search?limit=6", { withCredentials: true });
        if (res.data?.success && isMounted) {
          setTrending({
            users: res.data.users || [],
            hashtags: res.data.hashtags || [],
          });
        }
      } catch {
        // Fallback silently if offline
      }
    };
    loadTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Debounced search query
  useEffect(() => {
    if (!searchText.trim()) {
      setResults({ users: [], posts: [], hashtags: [] });
      onSearchResults?.([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(
          `/search?q=${encodeURIComponent(searchText.trim())}&type=${activeTab}&limit=8`,
          { withCredentials: true }
        );
        if (res.data?.success) {
          const fetchedResults = {
            users: res.data.users || [],
            posts: res.data.posts || [],
            hashtags: res.data.hashtags || [],
          };
          setResults(fetchedResults);
          onSearchResults?.([
            ...(fetchedResults.users || []),
            ...(fetchedResults.posts || []),
          ]);
        }
      } catch (err) {
        console.error("TopBar search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchText, activeTab]);

  // 3. Global keyboard shortcut listener (Press '/' or 'Cmd+K' / 'Ctrl+K' to focus)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is already typing in an input/textarea
      const tagName = document.activeElement?.tagName?.toLowerCase();
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) &&
        tagName !== "input" &&
        tagName !== "textarea"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 4. Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. Close search dropdown on route changes
  useEffect(() => {
    setIsFocused(false);
  }, [location.pathname]);

  const handleClear = () => {
    setSearchText("");
    setResults({ users: [], posts: [], hashtags: [] });
    inputRef.current?.focus();
  };

  const handleViewAllResults = (e) => {
    e?.preventDefault();
    if (!searchText.trim()) return;
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(searchText.trim())}&type=${activeTab}`);
  };

  const handleSelectHashtag = (tag) => {
    const clean = tag.replace(/^#/, "");
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(`#${clean}`)}&type=hashtags`);
  };

  const handleSelectUser = (userId) => {
    setIsFocused(false);
    navigate(`/profile/${userId}`);
  };

  const handleSelectPost = (post) => {
    setIsFocused(false);
    dispatch(setSelectedPost(post));
    setCommentDialogOpen(true);
  };

  const hasResults =
    results.users.length > 0 || results.posts.length > 0 || results.hashtags.length > 0;

  return (
    <>
      <header className="w-full h-15 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Brand / Title (Mobile visible, compact on desktop) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform md:hidden">
              N
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Net-ly
            </span>
          </Link>
        </div>

        {/* Global Search Bar Section */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-md md:max-w-lg lg:max-w-xl mx-auto"
        >
          <div
            className={`relative flex items-center w-full transition-all duration-200 rounded-xl border ${
              isFocused
                ? "bg-zinc-900 border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg"
                : "bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14]"
            }`}
          >
            {/* Search Icon */}
            <div className="pl-3.5 pr-2 text-zinc-400">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Search className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleViewAllResults(e);
                }
              }}
              placeholder="Search users, posts, or #hashtags..."
              className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none pr-16"
            />

            {/* Clear button and shortcut badge */}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchText ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800/80 border border-zinc-700/60 px-1.5 py-0.5 rounded-md pointer-events-none">
                  <span>/</span>
                </kbd>
              )}
            </div>
          </div>

          {/* Interactive Search Dropdown Popover */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150 backdrop-blur-xl">
              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-1 p-2 bg-zinc-900/90 border-b border-zinc-800/80 text-xs font-semibold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                    activeTab === "all"
                      ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>All</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                    activeTab === "users"
                      ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("posts")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                    activeTab === "posts"
                      ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Posts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("hashtags")}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                    activeTab === "hashtags"
                      ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  <span>Hashtags</span>
                </button>
              </div>

              {/* Scrollable Results Area */}
              <div className="max-h-96 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-3">
                {/* 1. ZERO STATE: TRENDING & SUGGESTED */}
                {!searchText.trim() && (
                  <div className="space-y-4 p-2">
                    {/* Trending Hashtags */}
                    {trending.hashtags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          <TrendingUp className="w-3.5 h-3.5 text-[#FACE25]" />
                          <span>Trending Hashtags</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {trending.hashtags.map((ht) => (
                            <button
                              key={ht.tag}
                              type="button"
                              onClick={() => handleSelectHashtag(ht.tag)}
                              className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-[#FACE25]/50 text-xs text-zinc-300 hover:text-[#FACE25] transition flex items-center gap-1 cursor-pointer"
                            >
                              <Hash className="w-3 h-3 text-[#FACE25]" />
                              <span>{ht.tag}</span>
                              <span className="text-[10px] text-zinc-500 font-mono ml-0.5">
                                {ht.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested People */}
                    {trending.users.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <span>Suggested People</span>
                        </div>
                        <div className="space-y-1.5">
                          {trending.users.slice(0, 4).map((u) => (
                            <div
                              key={u._id}
                              onClick={() => handleSelectUser(u._id)}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar className="h-8 w-8 border border-zinc-700">
                                  <AvatarImage src={u.profilePicture} />
                                  <AvatarFallback className="bg-zinc-800 text-xs font-bold text-[#FACE25]">
                                    {u.username?.[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="truncate">
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-bold text-white truncate">
                                      @{u.username}
                                    </p>
                                    {Boolean(u.isBlueTag) && <BlueTagBadge size="xs" />}
                                  </div>
                                  {u.fullName && (
                                    <p className="text-[11px] text-zinc-400 truncate">
                                      {u.fullName}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] text-zinc-500">
                                {u.followersCount || 0} followers
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. ACTIVE RESULTS */}
                {searchText.trim() && (
                  <>
                    {/* A. Hashtags Results */}
                    {(activeTab === "all" || activeTab === "hashtags") &&
                      results.hashtags.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">
                            Hashtags
                          </p>
                          <div className="space-y-1">
                            {results.hashtags.slice(0, 4).map((ht) => (
                              <div
                                key={ht.tag}
                                onClick={() => handleSelectHashtag(ht.tag)}
                                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FACE25] group-hover:scale-105 transition">
                                    <Hash className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-white group-hover:text-[#FACE25] transition">
                                    #{ht.tag}
                                  </span>
                                </div>
                                <span className="text-[11px] text-zinc-400">
                                  {ht.count} {ht.count === 1 ? "post" : "posts"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* B. Users Results */}
                    {(activeTab === "all" || activeTab === "users") &&
                      results.users.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">
                            Users
                          </p>
                          <div className="space-y-1">
                            {results.users.slice(0, 5).map((u) => {
                              const isUsuper =
                                u.role === "super_admin" ||
                                SUPER_ADMIN_EMAILS.includes((u.email || "").toLowerCase());

                              return (
                                <div
                                  key={u._id}
                                  onClick={() => handleSelectUser(u._id)}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar className="h-8 w-8 border border-zinc-700 flex-shrink-0 group-hover:border-[#FACE25] transition">
                                      <AvatarImage src={u.profilePicture} />
                                      <AvatarFallback className="bg-zinc-800 text-xs font-bold text-[#FACE25]">
                                        {u.username?.[0]?.toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="truncate">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-bold text-white group-hover:text-[#FACE25] transition truncate">
                                          @{u.username}
                                        </p>
                                        {Boolean(u.isBlueTag) && <BlueTagBadge size="xs" />}
                                        {isUsuper && (
                                          <Crown className="w-3 h-3 text-[#FACE25]" />
                                        )}
                                      </div>
                                      {u.fullName && (
                                        <p className="text-[11px] text-zinc-400 truncate">
                                          {u.fullName}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-zinc-500 flex-shrink-0">
                                    {u.followersCount || 0} followers
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* C. Posts Results */}
                    {(activeTab === "all" || activeTab === "posts") &&
                      results.posts.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">
                            Posts
                          </p>
                          <div className="space-y-1.5">
                            {results.posts.slice(0, 4).map((p) => (
                              <div
                                key={p._id}
                                onClick={() => handleSelectPost(p)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition group"
                              >
                                {/* Media thumbnail preview */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 relative">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt="Post"
                                      className="w-full h-full object-cover group-hover:scale-105 transition"
                                    />
                                  ) : p.video ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center text-[#FACE25]">
                                      <Film className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>

                                <div className="truncate flex-1">
                                  <p className="text-xs text-white group-hover:text-[#FACE25] transition truncate">
                                    {p.caption ? `"${p.caption}"` : "Post with media"}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                                    <span>@{p.author?.username || "user"}</span>
                                    <span>·</span>
                                    <span>{p.likesCount || 0} likes</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* No results message */}
                    {!loading && !hasResults && (
                      <div className="p-6 text-center text-zinc-500 text-xs">
                        No matches found for "{searchText}". Try searching by #hashtag or @username.
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* View all results footer */}
              {searchText.trim() && (
                <button
                  type="button"
                  onClick={handleViewAllResults}
                  className="w-full py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-850 border-t border-zinc-800/80 text-xs font-bold text-[#FACE25] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>View all results for "{searchText}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Messages, Notification & User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Direct Messages Quick Action */}
          <Link
            to="/chat"
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition cursor-pointer"
            title="Direct Messages"
          >
            <MessageCircle className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-amber-500 text-zinc-950 rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-sm">
                {unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Notifications bell */}
          <button
            type="button"
            onClick={() => setNotificationOpen(true)}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-rose-500 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-sm">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User profile avatar link */}
          {user && (
            <Link
              to={`/profile/${user._id}`}
              className="flex items-center gap-2 p-0.5 rounded-xl hover:bg-white/[0.06] transition"
              title="My Profile"
            >
              <Avatar className="h-8 w-8 border border-white/10 hover:border-amber-400/50 transition">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-zinc-800 text-xs font-bold text-amber-400">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </header>

      {/* Notifications Dialog */}
      <NotificationDialog
        open={notificationOpen}
        setOpen={setNotificationOpen}
        likeNotification={likeNotification}
      />

      {/* Post Viewer Comment Dialog */}
      <CommentDialog open={commentDialogOpen} setOpen={setCommentDialogOpen} />
    </>
  );
}
