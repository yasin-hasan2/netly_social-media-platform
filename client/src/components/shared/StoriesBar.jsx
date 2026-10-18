import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { axiosInstance } from "@/lib/axios";
import { useSelector } from "react-redux";
import CreateStoryModal from "./CreateStoryModal";
import StoryViewerModal from "./StoryViewerModal";

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const { user } = useSelector((store) => store.auth);

  const loadStories = async () => {
    try {
      const res = await axiosInstance.get("/story/all", { withCredentials: true });
      if (res.data?.success) {
        setStoryGroups(res.data.storyGroups || []);
      }
    } catch (err) {
      console.warn("Could not load stories:", err);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const userGroupIndex = storyGroups.findIndex(
    (g) => (g.author?._id || g.author) === user?._id
  );
  const userHasStory = userGroupIndex !== -1;

  const handleOpenGroup = (index) => {
    setSelectedGroupIndex(index);
    setViewerModalOpen(true);
  };

  const handleUserStoryClick = (e) => {
    e.stopPropagation();
    if (userHasStory && userGroupIndex !== -1) {
      handleOpenGroup(userGroupIndex);
    } else {
      setCreateModalOpen(true);
    }
  };

  return (
    <div className="w-full mx-auto mb-4 bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-3.5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
        {/* Current User Story Item (Add or View) */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
          <div
            onClick={handleUserStoryClick}
            className="relative p-0.5 rounded-full hover:scale-105 transition-transform"
            title={userHasStory ? "View your story" : "Add to your story"}
          >
            <div
              className={`p-0.5 rounded-full ${
                userHasStory
                  ? "bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 shadow-md shadow-amber-500/20"
                  : "bg-zinc-800"
              }`}
            >
              <Avatar className="w-13 h-13 border-2 border-[#090D16]">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-zinc-800 text-amber-400 font-semibold text-xs">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Plus badge to add story */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setCreateModalOpen(true);
              }}
              className="absolute bottom-0 right-0 p-1 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Create new story"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 max-w-[64px] truncate">
            Your story
          </span>
        </div>

        {/* Other Users' Stories */}
        {storyGroups.map((group, idx) => {
          const authorName = group.author?.username || "creator";
          const allViewed = (group.stories || []).every((s) =>
            (s.views || []).includes(user?._id)
          );

          return (
            <div
              key={group.author?._id || idx}
              onClick={() => handleOpenGroup(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div
                className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                  allViewed
                    ? "bg-zinc-700"
                    : "bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500"
                }`}
              >
                <div className="p-0.5 bg-[#090D16] rounded-full">
                  <Avatar className="w-13 h-13 border border-white/10">
                    <AvatarImage src={group.author?.profilePicture} />
                    <AvatarFallback className="bg-zinc-800 text-amber-400 font-semibold text-xs">
                      {authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate group-hover:text-amber-400 transition">
                {authorName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        onStoryCreated={loadStories}
      />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        open={viewerModalOpen}
        setOpen={setViewerModalOpen}
        storyGroups={storyGroups}
        initialGroupIndex={selectedGroupIndex}
        onStoryDeleted={loadStories}
      />
    </div>
  );
}
