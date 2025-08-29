import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "../ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "../ui/badge";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const { user, userProfile } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const dispatch = useDispatch();

  const isFollowing = false;
  const isBookmarked = userProfile?.bookmarks;

  const changeEventHandler = (e) => setText(e.target.value.trimStart());

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.get(`/post/${post._id}/${action}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setPostLike(liked ? postLike - 1 : postLike + 1);
        setLiked(!liked);
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    if (!text) return;
    try {
      const res = await axiosInstance.post(
        `/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete post
  const deletePostHandler = async () => {
    try {
      const res = await axiosInstance.delete(`/post/delete/${post._id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedPostData = posts.filter((p) => p._id !== post._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  // Report post
  const reportPostHandler = async () => {
    if (reportReasons.length === 0)
      return toast.error("Select at least one reason");
    try {
      const res = await axiosInstance.post(
        `/post/${post._id}/report`,
        { reasons: reportReasons },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setReportDialogOpen(false);
        setReportReasons([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axiosInstance.get(`/post/${post._id}/bookmark`, {
        withCredentials: true,
      });
      if (res.data.success) toast.success(res.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleReportReason = (reason) => {
    if (reportReasons.includes(reason)) {
      setReportReasons(reportReasons.filter((r) => r !== reason));
    } else {
      setReportReasons([...reportReasons, reason]);
    }
  };

  const reportOptions = ["Spam", "Hate Speech", "Nudity", "Violence", "Other"];

  return (
    <div className="my-6 w-full max-w-md mx-auto p-4 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-medium">{post.author?.username}</span>
            {user?._id === post.author?._id && (
              <Badge variant="secondary">@Author</Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center gap-2">
            <DialogHeader>
              <DialogTitle>Options</DialogTitle>
            </DialogHeader>
            <hr className="w-3/4 border-gray-300" />

            {post.author?._id !== user?._id && (
              <Button
                className="w-32"
                variant={isFollowing ? "destructive" : "default"}
                onClick={() => {}}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}

            <Button variant="ghost" className="w-32">
              Add to favorites
            </Button>

            {user?._id === post.author?._id ? (
              <Button
                variant="outline"
                className="w-32 text-red-500"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-32 text-red-500"
                onClick={() => setReportDialogOpen(true)}
              >
                Report & Hide
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Image */}
      <img
        src={post.image}
        alt="post_img"
        className="w-full object-cover rounded-lg mb-2"
      />

      {/* Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              className="text-yellow-400 cursor-pointer"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              className="hover:text-gray-500 cursor-pointer"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-500"
          />
          <Send className="cursor-pointer hover:text-gray-500" />
        </div>
        {Array.isArray(isBookmarked) &&
        isBookmarked.some((b) => b._id === post._id) ? (
          <Bookmark
            onClick={bookmarkHandler}
            className="text-blue-600 cursor-pointer"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-500"
          />
        )}
      </div>

      {/* Likes */}
      <span className="font-medium block mb-2">{postLike} likes</span>

      {/* Caption */}
      <p className="text-sm mb-1">
        <span className="font-medium mr-1">{post.author?.username}</span>
        {post.caption.length > 100
          ? showFullCaption
            ? post.caption
            : post.caption.slice(0, 100) + "..."
          : post.caption}
        {post.caption.length > 100 && (
          <button
            onClick={() => setShowFullCaption((prev) => !prev)}
            className="ml-1 text-blue-400 text-xs font-semibold hover:underline"
          >
            {showFullCaption ? "See less" : "See more"}
          </button>
        )}
      </p>

      {/* Scrollable compact comment preview */}
      {comment.length > 0 && (
        <div className="max-h-20 overflow-y-auto mb-2 text-xs text-gray-600">
          {comment.slice(-5).map((c) => (
            <div key={c._id} className="flex gap-1 mb-1">
              <span className="font-semibold">{c.user?.username}:</span>
              <span className="truncate">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="flex items-center gap-2 border-t border-gray-300 pt-2">
        <input
          type="text"
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment..."
          className="flex-1 border-b border-gray-400 focus:border-blue-500 focus:outline-none text-sm pb-1"
        />
        <Button onClick={commentHandler} variant="ghost">
          Post
        </Button>
      </div>

      <CommentDialog open={open} setOpen={setOpen} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Delete Post
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deletePostHandler}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report & Hide Dialog */}
      {/* Report & Hide Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm mb-2">Why do you want to report this post?</p>

          <div className="flex flex-col gap-1 mb-4 max-h-40 overflow-y-auto">
            {reportOptions.map((reason) => (
              <label key={reason} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={reportReasons.includes(reason)}
                  onChange={() => toggleReportReason(reason)}
                  className="accent-blue-500"
                />
                {reason}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={reportPostHandler}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Post;
