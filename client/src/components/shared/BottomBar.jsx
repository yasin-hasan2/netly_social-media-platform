import { useState } from "react";
import {
  Home,
  PlusSquare,
  BookOpen,
  MessageCircle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomBar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="relative">
      {/* Bottom Nav */}
      <div className="flex justify-around items-center py-2 backdrop-blur-md bg-white/30 shadow-lg rounded-t-2xl">
        <PlusSquare className="w-6 h-6 cursor-pointer" />
        <BookOpen className="w-6 h-6 cursor-pointer" />
        <Home className="w-10 h-10 cursor-pointer text-blue-500" />{" "}
        {/* Bigger Home */}
        <MessageCircle className="w-6 h-6 cursor-pointer" />
        <User
          className="w-6 h-6 cursor-pointer"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        />
      </div>

      {/* Profile popup */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-14 right-4 flex flex-col gap-3 p-3 rounded-xl backdrop-blur-lg bg-white/40 shadow-xl"
          >
            <Settings className="w-6 h-6 cursor-pointer" />
            <LogOut className="w-6 h-6 cursor-pointer text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
