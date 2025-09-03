import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Particles from "@/components/animated/Particles";
import { motion } from "framer-motion";

export default function Signup() {
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState(null);
  console.log("users", allUsers, "error", error);
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  console.log(input.username);

  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/register", input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("user/allUsers", {
          withCredentials: true,
        });
        setAllUsers(res.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="relative flex items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Particles Background */}
      <Particles
        particleColors={["#FACE25", "#ffffff"]}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        alphaParticles={false}
        disableRotation={false}
      />

      {/* Main Content */}
      <motion.div
        className="absolute z-10 flex items-center justify-between w-11/12 max-w-5xl rounded-2xl shadow-2xl p-10 gap-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Animated Text */}
        <motion.div
          className="hidden md:flex w-1/2 items-center justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <motion.p
            className="text-white text-lg font-semibold"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            “Your journey begins here. Create your story with us.”
          </motion.p>
        </motion.div>

        {/* Signup Form */}
        <motion.form
          onSubmit={signupHandler}
          className="flex flex-col gap-5 w-full md:w-1/2 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {/* Heading */}
          <div className="my-4">
            <h1 className="text-center font-bold text-3xl text-yellow-400">
              Linkly
            </h1>
            <p className="text-sm text-center text-gray-300 mt-2">
              “Every connection begins with a step. Start yours today.”
            </p>
          </div>

          {/* Username */}
          <div className="relative">
            <span className="font-medium text-gray-200">Username</span>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2 bg-gray-800 text-white placeholder-gray-300"
              placeholder="Enter your username"
            />
            {/* Check if username exists */}
            {allUsers.some((user) => user.username === input.username) && (
              <h1 className="text-red-500 text-xs mt-1">
                Username already taken
              </h1>
            )}
          </div>

          {/* Email */}
          <div>
            <span className="font-medium text-gray-200">Email</span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2 bg-gray-800 text-white placeholder-gray-300"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <span className="font-medium text-gray-200">Password</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2 bg-gray-800 text-white placeholder-gray-300"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          {loading ? (
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </Button>
          ) : (
            <motion.button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Signup
            </motion.button>
          )}

          {/* Redirect to login */}
          <span className="text-center text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-400 font-medium hover:underline"
            >
              Login
            </Link>
          </span>
        </motion.form>
      </motion.div>
    </div>
  );
}
