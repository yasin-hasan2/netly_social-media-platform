import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { axiosInstance } from "@/lib/axios";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

export default function EditProfile() {
  const imageRef = useRef();
  //   const coverRef = useRef();
  const { user } = useSelector((store) => store.auth);
  //   console.log("user in edit profile", user);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture || "",
    // coverPicture: user?.coverPicture || "",
    bio: user?.bio || "",
    gender: user?.gender || "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInput({ ...input, profilePhoto: file });
    }
  };

  //   const coverChangeHandler = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setInput({ ...input, coverPicture: file });
  //   }
  // };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    // if (input.coverPicture instanceof File) {
    //   formData.append("coverPhoto", input.coverPicture);
    // }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/profile/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          //    coverPicture: res.data.user?.coverPicture,
          gender: res.data.user?.gender,
        };
        dispatch(setAuthUser(updatedUserData));
        toast.success(res.data.message);
        setLoading(false);
        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("edit profile error", error);
    }
  };

  // [note if you will want to add cover then uncomment the related code in this file  and the cover design on button af this file scroll down]

  return (
    <div className="flex max-w-2xl mx-auto pl-10 ">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>
        <div className="flex items-center justify-between gap-2 bg-gray-200  rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={user?.profilePicture}
                alt="post_image"
              ></AvatarImage>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className="">
              <h1 className="font-bold text-sm"> {user?.username} </h1>
              <span className="text-gray-600 text-sm">
                {" "}
                {user?.bio || "Bio here ..."}{" "}
              </span>
            </div>
          </div>
          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            className="hidden"
          />
          <Button
            onClick={() => imageRef?.current.click()}
            className={"bg-[#fbcf28] h-8 hover:bg-[#cfb865]"}
          >
            Change Photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            className={"focus-visible:ring-transparent"}
          />
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className={"bg-[#fbcf28] h-8 hover:bg-[#cfb865]"}>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className={"bg-[#fbcf28] h-8 hover:bg-[#cfb865]"}
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

// Note if you will want to add cover photo feature then uncomment the related code in this file and also in user.controller.js and user.route.js files.

{
  /* <div className="flex items-center justify-between gap-2 bg-gray-200 rounded-xl p-4">
  <h1 className="font-bold text-sm">Cover Photo</h1>
  <input
    ref={coverRef}
    onChange={coverChangeHandler}
    type="file"
    className="hidden"
  />
  <Button
    onClick={() => coverRef?.current.click()}
    className={"bg-[#fbcf28] h-8 hover:bg-[#cfb865]"}
  >
    Change Cover
  </Button>
</div> */
}
