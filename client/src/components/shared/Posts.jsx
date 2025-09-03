import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

export default function Posts() {
  const { posts } = useSelector((store) => store.post);
  return (
    <div className="w-full">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}
