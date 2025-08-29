import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const sendMessageHandler = async () => {
    try {
      const res = await axiosInstance.post(
        `/post/${selectedPost?._id}/comment`,
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
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const displayedComments = showAllComments ? comment : comment.slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="!max-w-6xl w-full max-h-[90vh] md:max-h-[80vh] flex flex-col md:flex-row rounded-lg overflow-hidden
                   bg-white/20 backdrop-blur-xl shadow-xl p-0 border border-white/30"
      >
        {/* Post Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img
            src={selectedPost?.image}
            alt="post_img"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Comments Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/30">
            <div className="flex gap-3 items-center">
              <Link>
                <Avatar>
                  <AvatarImage src={selectedPost?.author?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link className="font-semibold text-sm text-white">
                  {selectedPost?.author?.username}
                </Link>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <MoreHorizontal className="cursor-pointer text-white" />
              </DialogTrigger>
              <DialogContent className="flex flex-col items-center text-sm text-center bg-white/10 backdrop-blur-md p-2 rounded">
                <div className="cursor-pointer w-full text-[#ED4956] font-bold p-2">
                  Unfollow
                </div>
                <div className="cursor-pointer w-full p-2">
                  Add to favorites
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[40vh] md:max-h-[65vh] scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-transparent">
            {displayedComments.map((c) => (
              <Comment key={c._id} comment={c} />
            ))}
            {comment.length > 8 && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-blue-400 text-sm mt-2 hover:underline"
              >
                {showAllComments ? "See Less" : "See More"}
              </button>
            )}
          </div>

          {/* Add Comment */}
          <div className="p-4 border-t border-white/30 bg-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={changeEventHandler}
                placeholder="Add a comment..."
                className="w-full outline-none border text-sm border-white/30 p-2 rounded bg-white/20 text-white backdrop-blur-sm"
              />
              <Button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                variant="outline"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
