import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import useFollowHandler from "@/hooks/useFollowHandler";
import { formatTimeAgo } from "@/lib/utils";
import { MapPin, MessageCircle, Smile, Send, Sparkles } from "lucide-react";
import BlueTagBadge from "./BlueTagBadge";

const QUICK_EMOJIS = ["❤️", "🔥", "👏", "😂", "🚀", "✨"];

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const authorId =
    selectedPost?.author?._id ||
    (typeof selectedPost?.author === "string" ? selectedPost?.author : null);
  const {
    following: isFollowingAuthor,
    followHandler: handleFollowAuthor,
    loading: followLoading,
  } = useFollowHandler(authorId);

  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost.comments || []);
    }
  }, [selectedPost]);

  const sendMessageHandler = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!text.trim() || !selectedPost) return;

    try {
      setSubmitting(true);
      const res = await axiosInstance.post(
        `/post/${selectedPost._id}/comment`,
        { text: text.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        const newComment = res.data.comment;
        const updatedComments = [...comments, newComment];
        setComments(updatedComments);

        const updatedPostData = (posts || []).map((p) =>
          p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success("Comment posted!");
        setText("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const hasVideo = Boolean(selectedPost?.video && selectedPost.video.trim());
  const hasImage = Boolean(selectedPost?.image && selectedPost.image.trim());
  const hasMedia = hasVideo || hasImage;
  const authorName = selectedPost?.author?.username || "Author";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="!max-w-4xl w-full max-h-[90vh] md:max-h-[82vh] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 text-white p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Post Details and Discussion</DialogTitle>

        {/* Media or Text Showcase Column */}
        {hasVideo ? (
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center max-h-72 md:max-h-full overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800">
            <video
              src={selectedPost.video}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain max-h-[75vh]"
            />
          </div>
        ) : hasImage ? (
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center max-h-72 md:max-h-full overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800">
            <img
              src={selectedPost.image}
              alt="Post media"
              className="w-full h-full object-contain max-h-[75vh]"
            />
          </div>
        ) : (
          <div className="w-full md:w-5/12 bg-zinc-900/60 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#FACE25] font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Featured Thought</span>
              </div>
              <p className="text-base text-zinc-100 font-medium leading-relaxed italic">
                "{selectedPost?.caption}"
              </p>
            </div>

            {selectedPost?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4">
                {selectedPost.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-[#FACE25] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Details & Comments Column */}
        <div className={`flex flex-col ${hasMedia ? "w-full md:w-1/2" : "w-full md:w-7/12"}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/60">
            <div className="flex gap-3 items-center">
              <Link to={`/profile/${authorId || ""}`}>
                <Avatar className="w-9 h-9 border border-zinc-700">
                  <AvatarImage src={selectedPost?.author?.profilePicture} />
                  <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-semibold text-xs">
                    {authorName[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    to={`/profile/${authorId || ""}`}
                    className="font-semibold text-sm text-zinc-100 hover:text-[#FACE25] transition"
                  >
                    {authorName}
                  </Link>
                  {Boolean(selectedPost?.author?.isBlueTag) && (
                    <BlueTagBadge size="xs" />
                  )}

                  {user && authorId && authorId !== user._id && (
                    <button
                      type="button"
                      disabled={followLoading}
                      onClick={handleFollowAuthor}
                      className={`text-xs font-semibold hover:underline transition ${
                        isFollowingAuthor ? "text-zinc-500" : "text-[#FACE25]"
                      }`}
                    >
                      · {isFollowingAuthor ? "Following" : "Follow"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span>{formatTimeAgo(selectedPost?.createdAt)}</span>
                  {selectedPost?.location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#FACE25]" />
                        {selectedPost.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Caption (if has image) */}
          {hasImage && selectedPost?.caption && (
            <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/20 text-xs text-zinc-200 leading-relaxed">
              <span className="font-semibold mr-1.5 text-zinc-100">{authorName}:</span>
              <span>{selectedPost.caption}</span>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[45vh] md:max-h-[50vh] scrollbar-thin scrollbar-thumb-zinc-700">
            {comments.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-zinc-500 text-xs gap-2">
                <MessageCircle className="w-6 h-6 text-zinc-600" />
                <p>No comments yet. Start the conversation!</p>
              </div>
            ) : (
              comments.map((c) => <Comment key={c._id} comment={c} />)
            )}
          </div>

          {/* Add Comment Input Dock */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
            <form onSubmit={sendMessageHandler} className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25] transition"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!text.trim() || submitting}
                className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-semibold h-8 px-3 text-xs rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </form>

            {/* Quick Emoji Reaction Row */}
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Smile className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              {QUICK_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setText((prev) => prev + em)}
                  className="p-1 hover:bg-zinc-800 rounded transition text-xs cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
