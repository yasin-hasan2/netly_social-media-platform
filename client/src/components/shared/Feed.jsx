import Posts from "./Posts";
import StoriesBar from "./StoriesBar";

export default function Feed() {
  return (
    <div className="flex-1 my-6 flex flex-col items-center w-full">
      <StoriesBar />
      <Posts />
    </div>
  );
}
