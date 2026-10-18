import Messages from "@/components/shared/Messages";
import BlueTagBadge from "@/components/shared/BlueTagBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { axiosInstance } from "@/lib/axios";
import {
  setMessages,
  setSelectedUser,
  updateContactLastMessage,
  clearMessages,
} from "@/redux/chatSlice";
import { clearMessageNotificationsForSender } from "@/redux/rtnSlice";
import useGetChatUsers from "@/hooks/useGetChatUsers";
import useFollowHandler from "@/hooks/useFollowHandler";
import {
  ArrowLeft,
  Search,
  UserCheck,
  UserPlus,
  Users,
  ExternalLink,
  ShieldAlert,
  MoreVertical,
  Trash2,
  Share2,
  Smile,
  Send,
  X,
  Reply,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const COMMON_EMOJIS = ["😀", "😂", "🥰", "🔥", "👍", "❤️", "👏", "🚀", "🎉", "💯", "🙌", "✨"];

export default function ChatPage() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  // Load chat contacts hook
  const { refreshContacts } = useGetChatUsers();

  const [textMessage, setTextMessage] = useState("");
  const [contactsSearchQuery, setContactsSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'following' | 'followers'
  const [isSending, setIsSending] = useState(false);

  // Active chat options & states
  const [replyingTo, setReplyingTo] = useState(null);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.socketIo);
  const chatState = useSelector((state) => state.chat);
  const selectedUser = chatState?.selectedUser || null;
  const onlineUsers = chatState?.onlineUsers || [];
  const messages = chatState?.messages || [];
  const rawChatContacts = chatState?.chatContacts;
  const typingUsers = chatState?.typingUsers || {};
  const isContactTyping = Boolean(
    selectedUser?._id && typingUsers[selectedUser._id]
  );
  const chatContacts = useMemo(
    () => (Array.isArray(rawChatContacts) ? rawChatContacts : []),
    [rawChatContacts]
  );
  const loadingContacts = Boolean(chatState?.loadingContacts);

  // Clear unread message notifications when viewing a conversation
  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(clearMessageNotificationsForSender(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  const emitTyping = useCallback(() => {
    if (!selectedUser?._id || !socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", {
        receiverId: selectedUser._id,
        senderId: user?._id,
        username: user?.username,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
        senderId: user?._id,
      });
    }, 2500);
  }, [selectedUser?._id, socket, user?._id, user?.username]);

  const emitStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && selectedUser?._id && socket) {
      isTypingRef.current = false;
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
        senderId: user?._id,
      });
    }
  }, [selectedUser?._id, socket, user?._id]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTextMessage(val);
    if (val.trim().length > 0) {
      emitTyping();
    } else {
      emitStopTyping();
    }
  };

  // Clean up typing state on contact change or unmount
  useEffect(() => {
    return () => {
      emitStopTyping();
    };
  }, [emitStopTyping]);

  // Follow/unfollow on the currently selected contact
  const {
    following: isFollowingSelected,
    followHandler: handleToggleFollowSelected,
    loading: followLoading,
  } = useFollowHandler(selectedUser?._id);

  // Auto-select contact if URL contains /chat/:id
  useEffect(() => {
    if (!params.id) return;
    const targetId = params.id;

    const existing = chatContacts?.find(
      (c) => c._id?.toString() === targetId.toString()
    );
    if (existing) {
      dispatch(setSelectedUser(existing));
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/user/${targetId}/profile`, {
          withCredentials: true,
        });
        if (res.data?.success && res.data.user) {
          const fetched = res.data.user;
          dispatch(
            setSelectedUser({
              _id: fetched._id,
              username: fetched.username,
              fullName: fetched.fullName,
              profilePicture: fetched.profilePicture,
              bio: fetched.bio,
              isFollowing: (user?.following || []).some(
                (id) => (id?._id || id).toString() === fetched._id.toString()
              ),
              isFollower: (user?.followers || []).some(
                (id) => (id?._id || id).toString() === fetched._id.toString()
              ),
            })
          );
        }
      } catch (err) {
        console.error("Error loading chat partner profile:", err);
      }
    };
    fetchUser();
  }, [params.id, chatContacts, user?.following, user?.followers, dispatch]);

  // Clean up selection on unmount
  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  // Filter contacts by query & tab
  const filteredContacts = useMemo(() => {
    return (chatContacts || []).filter((contact) => {
      if (contact._id?.toString() === user?._id?.toString()) return false;

      const isFollowing =
        contact.isFollowing ||
        (user?.following || []).some(
          (id) => (id?._id || id).toString() === contact._id?.toString()
        );
      const isFollower =
        contact.isFollower ||
        (user?.followers || []).some(
          (id) => (id?._id || id).toString() === contact._id?.toString()
        );

      if (activeFilter === "following" && !isFollowing) return false;
      if (activeFilter === "followers" && !isFollower) return false;

      if (contactsSearchQuery.trim()) {
        const q = contactsSearchQuery.toLowerCase();
        const usernameMatch = contact.username?.toLowerCase().includes(q);
        const nameMatch = contact.fullName?.toLowerCase().includes(q);
        return usernameMatch || nameMatch;
      }

      return true;
    });
  }, [
    chatContacts,
    activeFilter,
    contactsSearchQuery,
    user?.following,
    user?.followers,
    user?._id,
  ]);

  // Messaging permission check
  const canMessageSelected = useMemo(() => {
    if (!selectedUser || !user) return false;
    const targetIdStr = selectedUser._id?.toString();
    const isFollowing =
      isFollowingSelected ||
      (user.following || []).some(
        (id) => (id?._id || id).toString() === targetIdStr
      );
    const isFollower =
      selectedUser.isFollower ||
      (user.followers || []).some(
        (id) => (id?._id || id).toString() === targetIdStr
      );
    return isFollowing || isFollower;
  }, [selectedUser, user, isFollowingSelected]);

  // Back button for mobile users
  const handleBackToInbox = () => {
    emitStopTyping();
    dispatch(setSelectedUser(null));
    setReplyingTo(null);
    setShowChatSearch(false);
    setChatSearchQuery("");
    navigate("/chat");
  };

  // Send message
  const sendMessageHandler = async (receiverId) => {
    const trimmed = textMessage.trim();
    if (!trimmed || isSending) return;

    emitStopTyping();

    if (!canMessageSelected) {
      toast.error(
        "You can only message users you follow. Follow this user to start chatting!"
      );
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        textMessage: trimmed,
        replyTo: replyingTo
          ? {
              messageId: replyingTo.messageId,
              content: replyingTo.content,
              senderUsername: replyingTo.senderUsername,
            }
          : null,
      };

      const res = await axiosInstance.post(
        `/message/send/${receiverId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMsg = res.data.newMessage;
        dispatch(setMessages([...messages, newMsg]));
        dispatch(
          updateContactLastMessage({
            partnerId: receiverId,
            message: newMsg,
          })
        );
        setTextMessage("");
        setReplyingTo(null);
        setShowEmojiPicker(false);
      } else {
        toast.error(res.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to send message";
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectContact = (contact) => {
    emitStopTyping();
    dispatch(setSelectedUser(contact));
    setReplyingTo(null);
    setShowChatSearch(false);
    setChatSearchQuery("");
    navigate(`/chat/${contact._id}`);
  };

  const handleQuickFollowAndChat = async () => {
    const res = await handleToggleFollowSelected();
    if (res?.success) {
      refreshContacts();
    }
  };

  const handleCopyProfileLink = async () => {
    if (!selectedUser?._id) return;
    setMenuOpen(false);
    try {
      const url = `${window.location.origin}/profile/${selectedUser._id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleClearChatHistory = async () => {
    if (!selectedUser?._id) return;
    setMenuOpen(false);
    try {
      await axiosInstance.delete(`/message/clear/${selectedUser._id}`, {
        withCredentials: true,
      });
      dispatch(clearMessages());
      toast.success("Conversation cleared");
    } catch {
      dispatch(clearMessages());
      toast.success("Conversation cleared from screen");
    }
  };

  const handleReplyFromMessage = (replyData) => {
    setReplyingTo(replyData);
    inputRef.current?.focus();
  };

  const formatLastMessageTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "now";
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] md:h-screen max-w-7xl mx-auto p-0 md:p-4 gap-0 md:gap-4 overflow-hidden">
      {/* 
        INBOX CONTACTS SIDEBAR:
        - Mobile: Shown only when NO contact is selected (!selectedUser)
        - Desktop (md+): Always shown side-by-side
      */}
      <section
        className={`w-full md:w-[350px] lg:w-[380px] h-full flex flex-col bg-zinc-950/70 md:bg-white/10 backdrop-blur-xl md:rounded-2xl p-3 sm:p-4 border-0 md:border md:border-white/15 shadow-xl shrink-0 ${
          selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Inbox Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-[#FACE25]/60">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">
                Messages
              </h1>
              <p className="text-[11px] text-gray-400">
                @{user?.username} · {chatContacts?.length || 0} chats
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshContacts()}
            className="text-xs text-[#FACE25] hover:underline font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition"
          >
            Refresh
          </button>
        </div>

        {/* Contacts Search Bar */}
        <div className="relative my-2.5">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={contactsSearchQuery}
            onChange={(e) => setContactsSearchQuery(e.target.value)}
            placeholder="Search contacts or users..."
            className="pl-8 bg-white/10 border-white/10 text-white placeholder-gray-400 focus-visible:ring-[#FACE25] rounded-xl text-xs h-9"
          />
          {contactsSearchQuery && (
            <button
              onClick={() => setContactsSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex gap-1 p-1 bg-black/30 rounded-xl mb-2.5 border border-white/5">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "all"
                ? "bg-[#FACE25] text-zinc-950 font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("following")}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "following"
                ? "bg-[#FACE25] text-zinc-950 font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveFilter("followers")}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "followers"
                ? "bg-[#FACE25] text-zinc-950 font-semibold shadow-xs"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Followers
          </button>
        </div>

        {/* Contact list stream */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-1 scrollbar-thin scrollbar-thumb-white/15">
          {loadingContacts ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-xs">
              <div className="animate-spin w-5 h-5 border-2 border-[#FACE25] border-t-transparent rounded-full mb-2" />
              Loading conversations...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Users className="w-10 h-10 text-gray-500 mb-2 opacity-60" />
              <p className="text-white font-medium text-xs">No contacts found</p>
              <p className="text-gray-400 text-[11px] mt-1 mb-4 leading-relaxed max-w-[220px]">
                {activeFilter === "following"
                  ? "Follow people from your feed to chat with them here."
                  : activeFilter === "followers"
                  ? "You don't have any followers in this tab yet."
                  : contactsSearchQuery
                  ? "No contacts match your search."
                  : "Connect with creators to start direct messaging."}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/")}
                className="bg-[#FACE25] text-black hover:bg-[#d5be6b] font-medium text-xs rounded-xl h-8 px-3"
              >
                Discover Creators
              </Button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedUser?._id === contact._id;
              const contactOnline = onlineUsers.includes(contact._id);
              const isFollowing =
                contact.isFollowing ||
                (user?.following || []).some(
                  (id) => (id?._id || id).toString() === contact._id?.toString()
                );
              const isFollower =
                contact.isFollower ||
                (user?.followers || []).some(
                  (id) => (id?._id || id).toString() === contact._id?.toString()
                );

              return (
                <div
                  key={contact._id}
                  onClick={() => handleSelectContact(contact)}
                  className={`flex gap-3 items-center p-2 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#FACE25]/15 border-[#FACE25]/40 text-white shadow-xs"
                      : "bg-white/5 border-transparent hover:bg-white/10 text-gray-200"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11 border border-white/15">
                      <AvatarImage src={contact?.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span
                      title={contactOnline ? "Online" : "Offline"}
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                        contactOnline ? "bg-emerald-500" : "bg-zinc-600"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-semibold text-white text-xs sm:text-sm truncate">
                          {contact?.username}
                        </span>
                        {Boolean(contact?.isBlueTag) && <BlueTagBadge size="xs" />}
                      </div>
                      {contact.lastMessage?.createdAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatLastMessageTime(contact.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isFollowing && isFollower ? (
                        <span className="text-[10px] text-emerald-400 font-medium shrink-0">
                          Mutual ·
                        </span>
                      ) : isFollowing ? (
                        <span className="text-[10px] text-[#FACE25] font-medium shrink-0">
                          Following ·
                        </span>
                      ) : isFollower ? (
                        <span className="text-[10px] text-sky-400 font-medium shrink-0">
                          Follower ·
                        </span>
                      ) : null}

                      {typingUsers[contact._id] ? (
                        <span className="text-[11px] text-[#FACE25] font-medium flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FACE25] animate-ping" />
                          typing...
                        </span>
                      ) : (
                        <p className="text-[11px] text-gray-400 truncate">
                          {contact.lastMessage
                            ? contact.lastMessage.content
                            : contact.fullName || "Tap to chat"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 
        ACTIVE CHAT PANE:
        - Mobile: Shown only when contact is selected (selectedUser !== null), takes 100% viewport
        - Desktop: Always shown side-by-side or empty state
      */}
      {selectedUser ? (
        <section className="flex-1 w-full h-full flex flex-col bg-zinc-950/80 md:bg-white/10 backdrop-blur-xl md:rounded-2xl shadow-xl md:border md:border-white/15 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-white/10 bg-zinc-950/90 md:bg-white/10 backdrop-blur-md z-20 shrink-0">
            {/* Left: Mobile Back Button + User Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Back button for mobile users */}
              <button
                type="button"
                onClick={handleBackToInbox}
                aria-label="Back to messages list"
                className="md:hidden p-1.5 -ml-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border border-[#FACE25]/60">
                  <AvatarImage
                    src={selectedUser?.profilePicture}
                    alt={selectedUser?.username}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                    isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                  }`}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/profile/${selectedUser?._id}`}
                    className="font-bold text-white text-sm sm:text-base truncate hover:underline hover:text-[#FACE25]"
                  >
                    {selectedUser?.username}
                  </Link>
                  {Boolean(selectedUser?.isBlueTag) && <BlueTagBadge size="xs" />}
                  {selectedUser?.fullName && (
                    <span className="text-xs text-gray-400 truncate hidden lg:inline">
                      ({selectedUser.fullName})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  {isContactTyping ? (
                    <span className="text-[#FACE25] font-medium flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FACE25] animate-ping" />
                      typing...
                    </span>
                  ) : (
                    <span
                      className={
                        isOnline ? "text-emerald-400 font-medium" : "text-gray-400"
                      }
                    >
                      {isOnline ? "Active now" : "Offline"}
                    </span>
                  )}
                  <span>·</span>
                  <Link
                    to={`/profile/${selectedUser?._id}`}
                    className="hover:text-[#FACE25] flex items-center gap-0.5 text-[11px]"
                  >
                    Profile <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Follow Action & More Options Popover */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Follow / Following Compact Button */}
              <Button
                size="sm"
                variant="ghost"
                disabled={followLoading}
                onClick={handleToggleFollowSelected}
                className={`text-xs font-semibold rounded-xl h-8 px-2.5 transition-all ${
                  isFollowingSelected
                    ? "bg-white/10 hover:bg-red-500/20 text-gray-200 hover:text-red-400 border border-white/15"
                    : "bg-[#FACE25] text-zinc-950 hover:bg-[#d5be6b]"
                }`}
              >
                {isFollowingSelected ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    <span>Follow</span>
                  </>
                )}
              </Button>

              {/* Minimal Conversation Options Popover */}
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Conversation options"
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition active:scale-95"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  side="bottom"
                  sideOffset={6}
                  className="w-52 p-1.5 bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl text-white z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 border-b border-white/10 mb-1">
                    Chat Options
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowChatSearch((prev) => !prev);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left transition font-medium"
                    >
                      <Search className="w-3.5 h-3.5 text-sky-400" />
                      <span>{showChatSearch ? "Hide search" : "Search in chat"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyProfileLink}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left transition font-medium"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy profile link</span>
                    </button>

                    <Link
                      to={`/profile/${selectedUser?._id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left transition font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#FACE25]" />
                      <span>View full profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleClearChatHistory}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full text-left transition font-medium border-t border-white/10 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear conversation</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Optional Inline Chat Search Bar */}
          {showChatSearch && (
            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-white/10 text-xs shrink-0 animate-in slide-in-from-top-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-xs outline-hidden"
                autoFocus
              />
              {chatSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChatSearchQuery("")}
                  className="text-gray-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowChatSearch(false);
                  setChatSearchQuery("");
                }}
                className="text-[11px] text-gray-400 hover:text-white ml-1 px-1.5 py-0.5 rounded-md hover:bg-white/10"
              >
                Done
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto">
            <Messages
              selectedUser={selectedUser}
              onReply={handleReplyFromMessage}
              searchQuery={chatSearchQuery}
              isContactTyping={isContactTyping}
            />
          </div>

          {/* Bottom Dock: Reply Quote Preview + Follow Restriction / Message Input Bar */}
          <div className="border-t border-white/10 bg-zinc-950/90 md:bg-black/30 p-2.5 sm:p-3 shrink-0">
            {/* Replying Preview Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl text-xs text-white">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Reply className="w-3.5 h-3.5 text-[#FACE25] shrink-0" />
                  <span className="text-gray-400 shrink-0 text-[11px]">
                    Replying to @{replyingTo.senderUsername || selectedUser?.username}:
                  </span>
                  <span className="truncate text-gray-200 text-[11px] max-w-[170px] sm:max-w-md">
                    {replyingTo.content}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Emoji Bar Picker (if toggled open) */}
            {showEmojiPicker && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2 mb-2 bg-black/40 border border-white/10 rounded-xl scrollbar-none">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setTextMessage((prev) => prev + emoji);
                      emitTyping();
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 hover:bg-white/15 rounded-lg text-base transition transform active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 text-gray-400 hover:text-white ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!canMessageSelected ? (
              /* Sleek, Non-Intrusive Follow Prompt */
              <div className="flex items-center justify-between gap-3 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl">
                <div className="flex items-center gap-2 text-amber-300 text-xs min-w-0">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="truncate">
                    Follow @{selectedUser?.username} to start chatting
                  </span>
                </div>
                <Button
                  size="sm"
                  disabled={followLoading}
                  onClick={handleQuickFollowAndChat}
                  className="bg-[#FACE25] text-zinc-950 hover:bg-[#d5be6b] font-semibold text-xs shrink-0 rounded-xl h-7 px-3"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Follow
                </Button>
              </div>
            ) : (
              /* Modern, Sleek Message Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessageHandler(selectedUser._id);
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                {/* Quick Emoji Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  title="Emoji shortcuts"
                  className={`p-2 rounded-xl border transition ${
                    showEmojiPicker
                      ? "bg-[#FACE25]/20 text-[#FACE25] border-[#FACE25]/40"
                      : "bg-white/10 text-gray-400 hover:text-white border-white/10 hover:bg-white/15"
                  }`}
                >
                  <Smile className="w-4 h-4" />
                </button>

                <Input
                  ref={inputRef}
                  value={textMessage}
                  onChange={handleInputChange}
                  type="text"
                  className="flex-1 bg-white/10 text-white placeholder-gray-400 border-white/15 focus-visible:ring-[#FACE25] rounded-xl text-xs sm:text-sm h-10 px-3.5"
                  placeholder={`Message @${selectedUser?.username}...`}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !textMessage.trim()}
                  className={`w-10 h-10 rounded-xl font-semibold transition shrink-0 ${
                    textMessage.trim()
                      ? "bg-[#FACE25] text-zinc-950 hover:bg-[#d5be6b] shadow-md shadow-[#FACE25]/20 scale-100"
                      : "bg-white/10 text-gray-500 border border-white/10 hover:bg-white/10 cursor-not-allowed"
                  }`}
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      ) : (
        /* Empty Desktop State when no chat is selected (hidden on mobile) */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="w-16 h-16 rounded-full bg-[#FACE25]/15 border border-[#FACE25]/30 flex items-center justify-center mb-3">
            <MessageCircle className="w-8 h-8 text-[#FACE25]" />
          </div>
          <h2 className="font-bold text-xl text-white mb-1.5">Direct Messages</h2>
          <p className="text-gray-400 text-xs max-w-sm mb-6 leading-relaxed">
            Select a conversation on the left to start chatting in real time with creators you connect with.
          </p>

          {(chatContacts?.length || 0) > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {(chatContacts || []).slice(0, 4).map((c) => (
                <button
                  key={c._id}
                  onClick={() => handleSelectContact(c)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition text-white text-xs font-medium"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={c.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  @{c.username}
                </button>
              ))}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/")}
              className="bg-[#FACE25] text-zinc-950 hover:bg-[#d5be6b] font-semibold text-xs rounded-xl"
            >
              Explore Feed & Follow Users
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
