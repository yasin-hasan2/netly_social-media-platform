// import { createContext, useContext, useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     // connect once
//     socketRef.current = io("http://localhost:5000", {
//       withCredentials: true,
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
