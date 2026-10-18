import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { Button } from "./components/ui/button";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import EditProfile from "./components/shared/EditProfile";
import ChatPage from "./pages/ChatPage";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import {
  setNotifications,
  addNotification,
  addMessageNotification,
  setLikeNotification,
} from "./redux/rtnSlice";
import { toast } from "sonner";
import { setAuthUser } from "./redux/authSlice";
import { axiosInstance } from "./lib/axios";
import ProtectedRoute from "./routers/ProtectedRoute";
import AdminRoute from "./routers/AdminRoute";
import FeatureAndFeedback from "./pages/FeatureAndFeedback";
import ReelsPage from "./pages/ReelsPage";
import AdminPortal from "./pages/AdminPortal";
import SearchPage from "./pages/SearchPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/info/AboutPage";
import HelpPage from "./pages/info/HelpPage";
import PressPage from "./pages/info/PressPage";
import ApiDocsPage from "./pages/info/ApiDocsPage";
import JobsPage from "./pages/info/JobsPage";
import PrivacyPage from "./pages/info/PrivacyPage";
import TermsPage from "./pages/info/TermsPage";
import LocationsPage from "./pages/info/LocationsPage";
import LanguagePage from "./pages/info/LanguagePage";
import VerifiedPage from "./pages/info/VerifiedPage";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        {" "}
        <MainLayout />{" "}
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            {" "}
            <Home />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "/reels",
        element: (
          <ProtectedRoute>
            <ReelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoute>
            {" "}
            <Profile />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoute>
            {" "}
            <EditProfile />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/chat/:id",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin-portal",
    element: (
      <AdminRoute>
        <AdminPortal />
      </AdminRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/FeatureAndFeedback",
    element: <FeatureAndFeedback />,
  },
  {
    path: "/feature-and-feedback",
    element: <FeatureAndFeedback />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/help",
    element: <HelpPage />,
  },
  {
    path: "/press",
    element: <PressPage />,
  },
  {
    path: "/api",
    element: <ApiDocsPage />,
  },
  {
    path: "/jobs",
    element: <JobsPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/locations",
    element: <LocationsPage />,
  },
  {
    path: "/language",
    element: <LanguagePage />,
  },
  {
    path: "/verified",
    element: <VerifiedPage />,
  },
  {
    path: "/linkly-verified",
    element: <VerifiedPage />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.socketIo);
  // console.log("socket in app.jsx", socket);
  const dispatch = useDispatch();

  // Sync current user role & credentials from backend on load
  useEffect(() => {
    const syncCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/user/me", { withCredentials: true });
        if (res.data?.success && res.data.user) {
          dispatch(setAuthUser(res.data.user));
        }
      } catch {
        // Ignored if not authenticated
      }
    };
    syncCurrentUser();
  }, [dispatch]);

  // Load notification history
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/notification", { withCredentials: true });
        if (res.data?.success && res.data.notifications) {
          dispatch(setNotifications(res.data.notifications));
        }
      } catch {
        // Ignored
      }
    };
    fetchNotifications();
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      const socketUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const socket = io(socketUrl, {
        query: { userId: user?._id },
        transports: ["websocket", "polling"],
      });
      dispatch(setSocket(socket));

      socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      // Real-time notifications for Likes, Comments, Mentions, Reposts
      socket.on("notification", (notification) => {
        dispatch(addNotification(notification));
        const sender =
          notification.sender?.username ||
          notification.userDetails?.username ||
          "Someone";

        if (notification.type === "like") {
          toast.info(`❤️ @${sender} liked your post!`);
        } else if (notification.type === "comment") {
          const preview = notification.content ? ` "${notification.content.slice(0, 45)}..."` : "";
          toast.info(`💬 @${sender} commented on your post:${preview}`);
        } else if (notification.type === "mention") {
          const preview = notification.content ? ` "${notification.content.slice(0, 45)}..."` : "";
          toast.info(`🔔 @${sender} mentioned you:${preview}`);
        } else if (notification.type === "repost") {
          toast.info(`🔁 @${sender} reposted your post!`);
        }
      });

      // Real-time notification for incoming messages
      socket.on("messageNotification", (msgData) => {
        dispatch(addMessageNotification(msgData));
        const sender = msgData.senderUsername || "Someone";
        const preview = msgData.message ? ` "${msgData.message.slice(0, 45)}"` : "";
        toast(`💬 New message from @${sender}${preview}`);
      });

      socket.on("followStatusChanged", (data) => {
        if (data.isFollowing) {
          toast.info(`👤 @${data.followerUsername || "Someone"} started following you!`);
        }
      });

      return () => {
        socket.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
