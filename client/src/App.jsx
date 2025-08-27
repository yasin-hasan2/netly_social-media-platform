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
import { setLikeNotification } from "./redux/rtnSlice";
import ProtectedRoute from "./routers/ProtectedRoute";

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
            {" "}
            <ChatPage />{" "}
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
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

  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:8001", {
        query: { userId: user?._id },
        transports: ["websocket"],
      });
      dispatch(setSocket(socket));
      // Add any socket event listeners or emitters here
      // listen all the events
      socket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socket.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
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
