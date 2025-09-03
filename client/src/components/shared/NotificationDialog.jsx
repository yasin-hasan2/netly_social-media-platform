import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { X, Heart } from "lucide-react"; // icons

export default function NotificationDialog({
  open,
  setOpen,
  likeNotification = [],
}) {
  // console.log(likeNotification);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg w-[90%] max-w-md p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-bold text-[#FACE25]">
            Notifications
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {likeNotification.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No new notifications
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {likeNotification.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">
                        {item?.userDetails?.username}
                      </span>{" "}
                      liked your post
                    </p>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
