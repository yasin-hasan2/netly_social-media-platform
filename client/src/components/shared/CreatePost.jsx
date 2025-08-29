import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { readFileAsDataURL } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

export default function CreatePost({ open, setOpen }) {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setImagePreview(dataUrl);
      } catch (err) {
        console.error(err);
        setImagePreview("");
      }
    }
  };

  const createPostHandler = async (e) => {
    e.preventDefault();
    if (!caption && !imagePreview) {
      toast.error("Please add a caption or select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);

    try {
      setLoading(true);
      const res = await axiosInstance.post("/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        setCaption("");
        setFile("");
        setImagePreview("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-md w-full p-6 rounded-xl bg-gray-900 text-white shadow-lg"
      >
        <DialogHeader className="text-center font-bold text-xl text-[#FACE25]">
          Create New Post
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 my-4">
          <Avatar className="h-12 w-12 border-2 border-[#FACE25]">
            <AvatarImage src={user?.profilePicture} alt="user" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-white">{user?.username}</h1>
            <p className="text-gray-400 text-sm">Share your moments...</p>
          </div>
        </div>

        {/* Caption Input */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="w-full mb-4 resize-none border-none rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-1 focus:ring-[#FACE25]"
          rows={3}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-4 border border-gray-700 relative">
            <img
              src={imagePreview}
              alt="preview"
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => imageRef.current.click()}
            className="w-full bg-[#0095F6] hover:bg-[#258bcf] transition"
          >
            Select from Computer
          </Button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={fileChangeHandler}
          />
          {imagePreview && (
            <Button
              onClick={createPostHandler}
              className="w-full bg-[#FACE25] hover:bg-[#d5be6b] transition flex justify-center items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
