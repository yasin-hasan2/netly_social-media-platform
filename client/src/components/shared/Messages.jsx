import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";
import { axiosInstance } from "@/lib/axios";
import { deleteMessageAction, updateMessageReaction } from "@/redux/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Copy,
  Check,
  Reply,
  Trash2,
  MoreHorizontal,
  CheckCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const QUICK_EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "👏"];

export default function Messages({
  selectedUser,
  onReply,
  searchQuery = "",
  isContactTyping: isContactTypingProp,
}) {
  useGetRTM();
  useGetAllMessage();

  const dispatch = useDispatch();
  const { messages, typingUsers } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);

  const isContactTyping =
    isContactTypingProp !== undefined
      ? isContactTypingProp
      : Boolean(selectedUser?._id && typingUsers?.[selectedUser._id]);

  const [copiedId, setCopiedId] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Auto-scroll to bottom on messages update (unless user is searching)
  useEffect(() => {
    if (!searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchQuery]);

  // Smooth scroll when contact starts typing
  useEffect(() => {
    if (isContactTyping && !searchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isContactTyping, searchQuery]);

  const formatShortTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (isToday) return `Today at ${time}`;
      if (isYesterday) return `Yesterday at ${time}`;
      return `${d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })} at ${time}`;
    } catch {
      return "";
    }
  };

  // Group reactions by emoji
  const getGroupedReactions = (reactions) => {
    if (!Array.isArray(reactions) || reactions.length === 0) return [];
    const map = {};
    reactions.forEach((r) => {
      if (!r || !r.emoji) return;
      if (!map[r.emoji]) {
        map[r.emoji] = {
          emoji: r.emoji,
          count: 0,
          reactedByMe: false,
        };
      }
      map[r.emoji].count += 1;
      const rUid = r.userId?._id || r.userId;
      if (rUid?.toString() === user?._id?.toString()) {
        map[r.emoji].reactedByMe = true;
      }
    });
    return Object.values(map);
  };

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success("Message copied to clipboard");
      setOpenPopoverId(null);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy message");
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      setOpenPopoverId(null);
      const res = await axiosInstance.post(
        `/message/react/${messageId}`,
        { emoji },
        { withCredentials: true }
      );
      if (res.data.success && res.data.reactions) {
        dispatch(
          updateMessageReaction({
            messageId,
            reactions: res.data.reactions,
          })
        );
      }
    } catch (err) {
      console.error("Reaction failed:", err);
      toast.error("Could not update reaction");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      setIsDeletingId(messageId);
      setOpenPopoverId(null);
      const res = await axiosInstance.delete(`/message/delete/${messageId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(deleteMessageAction(messageId));
        toast.success("Message deleted");
      }
    } catch (err) {
      console.error("Delete message failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleReplyClick = (msg, isMe) => {
    setOpenPopoverId(null);
    if (onReply) {
      onReply({
        messageId: msg._id,
        content: msg.content,
        senderUsername: isMe ? user?.username : selectedUser?.username,
      });
    }
  };

  // Filter messages if search is active
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages || [];
    const q = searchQuery.toLowerCase();
    return (messages || []).filter((m) =>
      m.content?.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages List Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center my-auto py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-white">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Start the conversation by sending a message to @
              {selectedUser?.username}!
            </p>
          </div>
        )}

        {searchQuery.trim() && filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-gray-400">
              No messages found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {filteredMessages.map((msg, idx) => {
          const isMe = msg.senderId === user?._id;
          const groupedReactions = getGroupedReactions(msg.reactions);
          const hasReactions = groupedReactions.length > 0;
          const isDeleting = isDeletingId === msg._id;
          const isPopoverOpen = openPopoverId === msg._id;

          // Check if previous message was more than 30 mins ago for quiet date separator
          const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
          let showDateDivider = false;
          if (msg.createdAt && (!prevMsg || !prevMsg.createdAt)) {
            showDateDivider = true;
          } else if (msg.createdAt && prevMsg?.createdAt) {
            const timeDiff =
              new Date(msg.createdAt) - new Date(prevMsg.createdAt);
            if (timeDiff > 30 * 60 * 1000) {
              showDateDivider = true;
            }
          }

          return (
            <div key={msg._id} className="flex flex-col group">
              {/* Quiet Date Divider */}
              {showDateDivider && msg.createdAt && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-[11px] text-gray-400 font-medium px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs">
                    {formatFullDate(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Row with Bubble & Minimal Options Trigger */}
              <div
                className={`flex items-end gap-1.5 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {/* Desktop/Mobile Options Menu for incoming messages (on right of partner's bubble) */}
                {!isMe && (
                  <MessageOptionsPopover
                    msg={msg}
                    isMe={isMe}
                    isOpen={isPopoverOpen}
                    onOpenChange={(open) =>
                      setOpenPopoverId(open ? msg._id : null)
                    }
                    onReaction={handleReaction}
                    onReply={() => handleReplyClick(msg, isMe)}
                    onCopy={() => handleCopy(msg.content, msg._id)}
                    onDelete={() => handleDelete(msg._id)}
                    copiedId={copiedId}
                    formatFullDate={formatFullDate}
                  />
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[82%] sm:max-w-[72%] flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Bubble */}
                  <div
                    className={`relative px-3.5 py-2.5 rounded-2xl break-words text-sm shadow-sm transition-all ${
                      isMe
                        ? "bg-[#FACE25] text-zinc-950 font-medium rounded-br-xs"
                        : "bg-white/15 text-white backdrop-blur-md rounded-bl-xs border border-white/10"
                    } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    {/* Quoted Reply Preview */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 px-2.5 py-1 rounded-lg border-l-2 text-xs select-none ${
                          isMe
                            ? "bg-black/10 border-black/50 text-zinc-900"
                            : "bg-black/30 border-[#FACE25] text-gray-200"
                        }`}
                      >
                        <div className="font-semibold text-[10px] opacity-75">
                          {msg.replyTo.senderUsername
                            ? `@${msg.replyTo.senderUsername}`
                            : "Reply"}
                        </div>
                        <p className="truncate text-[11px] max-w-[200px] sm:max-w-xs opacity-90">
                          {msg.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* Text Message Content */}
                    <div className="whitespace-pre-wrap leading-relaxed select-text text-[13.5px] sm:text-sm">
                      {msg?.content}
                    </div>

                    {/* Meta line: time & delivered status */}
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 select-none text-[10px] ${
                        isMe ? "text-zinc-800/80" : "text-gray-400"
                      }`}
                    >
                      <span>{formatShortTime(msg.createdAt)}</span>
                      {isMe && (
                        <CheckCheck className="w-3.5 h-3.5 opacity-90 inline-block text-zinc-900" />
                      )}
                    </div>
                  </div>

                  {/* Reaction Badges */}
                  {hasReactions && (
                    <div
                      className={`flex flex-wrap items-center gap-1 -mt-2 z-10 ${
                        isMe ? "justify-end mr-1.5" : "justify-start ml-1.5"
                      }`}
                    >
                      {groupedReactions.map(
                        ({ emoji, count, reactedByMe }) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(msg._id, emoji)}
                            title={
                              reactedByMe ? "Remove reaction" : "React with " + emoji
                            }
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs backdrop-blur-md border shadow-sm transition active:scale-95 ${
                              reactedByMe
                                ? "bg-[#FACE25]/30 border-[#FACE25] text-white font-medium"
                                : "bg-zinc-900/80 border-white/20 text-gray-200 hover:bg-zinc-900"
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 1 && (
                              <span className="text-[10px] font-semibold">
                                {count}
                              </span>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop/Mobile Options Menu for user's own sent messages (on left of my bubble) */}
                {isMe && (
                  <MessageOptionsPopover
                    msg={msg}
                    isMe={isMe}
                    isOpen={isPopoverOpen}
                    onOpenChange={(open) =>
                      setOpenPopoverId(open ? msg._id : null)
                    }
                    onReaction={handleReaction}
                    onReply={() => handleReplyClick(msg, isMe)}
                    onCopy={() => handleCopy(msg.content, msg._id)}
                    onDelete={() => handleDelete(msg._id)}
                    copiedId={copiedId}
                    formatFullDate={formatFullDate}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time Typing Indicator Bubble */}
        {isContactTyping && (
          <div className="flex items-end gap-2 justify-start py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Avatar className="w-7 h-7 border border-[#FACE25]/50 shrink-0 mb-0.5 shadow-xs">
              <AvatarImage
                src={selectedUser?.profilePicture}
                alt={selectedUser?.username}
              />
              <AvatarFallback className="text-[10px] bg-zinc-800 text-gray-300">
                {selectedUser?.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="relative flex flex-col items-start">
              <span className="text-[10px] text-gray-400 ml-1 mb-1 font-medium flex items-center gap-1">
                @{selectedUser?.username} is typing
              </span>
              <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-xs bg-zinc-900/90 md:bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FACE25] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#FACE25] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#FACE25] animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Minimal, sleek Popover menu for message actions
function MessageOptionsPopover({
  msg,
  isMe,
  isOpen,
  onOpenChange,
  onReaction,
  onReply,
  onCopy,
  onDelete,
  copiedId,
  formatFullDate,
}) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Message options"
          className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 opacity-70 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0 active:scale-90"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={isMe ? "end" : "start"}
        side="top"
        sideOffset={6}
        className="w-56 p-1.5 bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl text-white z-50 animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Quick Emoji Reaction Row */}
        <div className="flex items-center justify-between px-1.5 py-1 mb-1 border-b border-white/10">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReaction(msg._id, emoji)}
              className="p-1 rounded-md hover:bg-white/15 text-sm transition transform hover:scale-125 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Action Items List */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={onReply}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left transition font-medium"
          >
            <Reply className="w-3.5 h-3.5 text-[#FACE25]" />
            <span>Reply</span>
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left transition font-medium"
          >
            {copiedId === msg._id ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>Copy text</span>
              </>
            )}
          </button>

          {isMe && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full text-left transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete message</span>
            </button>
          )}
        </div>

        {/* Quiet Timestamp Footer */}
        {msg.createdAt && (
          <div className="px-2.5 pt-1.5 mt-1 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
            <span>{formatFullDate(msg.createdAt)}</span>
            {isMe && <span className="text-emerald-400">Delivered</span>}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
