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
// import useFollowHandler from "@/hooks/useFollowHandler";
// import { updateFollowers } from "@/redux/userSlice";

const Post = ({ post, targetUserId }) => {
  // const { following, followHandler } = useFollowHandler(targetUserId);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user, userProfile } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);

  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const dispatch = useDispatch();

  // ✅ calculate isFollowing
  const isFollowing = false; // Default to true to avoid errors
  const isBookmarked = userProfile?.bookmarks; // Default to true to avoid errors
  // console.log("isBookmarked", isBookmarked);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.get(`/post/${post._id}/${action}`, {
        withCredentials: true,
      });
      console.log(res.data);
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        // apne post ko update krunga
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
    try {
      const res = await axiosInstance.post(
        `/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(res.data);
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

  const deletePostHandler = async () => {
    try {
      const res = await axiosInstance.delete(`/post/delete/${post?._id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axiosInstance.get(`/post/${post?._id}/bookmark`, {
        withCredentials: true,
      });
      if (res.data.success) {
        // console.log(res.data);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1>{post.author?.username}</h1>
            {user?._id === post.author?._id && (
              <Badge variant={"secondary"}>@Author</Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            <DialogHeader className="font-semibold">
              <DialogTitle>Options</DialogTitle>
            </DialogHeader>
            <hr className="w-3/4 h-0.5 bg-black " />
            {post.author?._id !== user?._id && (
              <button
                // onClick={() => followHandler(post.author._id)}
                className={`px-4 py-2 rounded-lg ${
                  isFollowing
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            <Button variant="ghost" className="cursor-pointer w-fit">
              Add to favorites
            </Button>

            {user?._id === post.author?._id ? (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={deletePostHandler}
                  variant="outline"
                  className="cursor-pointer w-fit"
                >
                  Delete
                </Button>

                <Button
                  variant="outline"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Report & Hide
                </Button>
                <Button variant={"outline"} className="cursor-pointer w-fit">
                  Hide
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative group rounded-sm my-2 w-full">
        <img className="rounded-sm w-full" src={post.image} alt="post_img" />
        <div
          className="absolute bottom-0 left-0 w-full p-3 min-h-[60px] flex items-end 
            bg-black bg-opacity-0 backdrop-blur-3xl 
            text-white text-justify opacity-0 translate-y-8 
            group-hover:opacity-50 group-hover:translate-y-0 
            transition-all duration-300 rounded-b-sm"
          style={{ pointerEvents: "none" }}
        >
          <span className="text-sm w-full">{post.caption}</span>
        </div>
      </div>

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={"22"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        {
          /* Bookmark functionality to be implemented */
          Array.isArray(isBookmarked) &&
          isBookmarked.some((b) => b._id === post._id) ? (
            <Bookmark
              onClick={bookmarkHandler}
              className="cursor-pointer text-blue-600"
            />
          ) : (
            <Bookmark
              onClick={bookmarkHandler}
              className="cursor-pointer hover:text-gray-600"
            />
          )
        }
        {/* <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-gray-600"
        /> */}
      </div>
      <span className="font-medium block mb-2">{post.likes?.length} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption &&
        (post.caption.split(" ").length > 10 || post.caption.length > 30) ? (
          <>
            {showFullCaption
              ? post.caption
              : post.caption.split(" ").slice(0, 10).join(" ").slice(0, 30) +
                (post.caption.length > 30 ? "..." : "")}
            <button
              className="text-[#3BADF8] ml-1 text-xs font-bold hover:underline"
              onClick={() => setShowFullCaption((prev) => !prev)}
            >
              {showFullCaption ? "See less" : "See more"}
            </button>
          </>
        ) : (
          post.caption
        )}
      </p>

      {comment?.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {comment?.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />

        <span
          onClick={commentHandler}
          className="text-[#3BADF8] cursor-pointer"
        >
          Post
        </span>
      </div>
    </div>
  );
};

export default Post;
