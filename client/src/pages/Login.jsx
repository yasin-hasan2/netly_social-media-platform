import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { setAuthUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Particles from "@/components/animated/Particles";
import { motion } from "framer-motion";

export default function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/login", input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
      <div className="absolute z-10 flex items-center justify-between w-11/12 max-w-5xl rounded-2xl shadow-2xl p-10 gap-10">
        {/* Animated Motivational Text Side */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl font-bold text-yellow-400 mb-4"
          >
            Welcome Back to Linkly
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-gray-300 text-lg"
          >
            Every login is a step closer to{" "}
            <span className="text-yellow-400 font-semibold">new stories,</span>
            <br />
            new memories, and new{" "}
            <span className="text-yellow-400 font-semibold">connections.</span>
          </motion.p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={signupHandler}
          className="flex flex-col gap-5 w-full md:w-1/2 bg-white/10 p-8 rounded-xl shadow-lg"
        >
          <div className="my-4">
            <h1 className="text-center font-bold text-3xl text-yellow-400">
              Linkly
            </h1>
            <p className="text-sm text-center text-gray-300">
              Login to see photos & videos from your friends
            </p>
          </div>

          <div>
            <span className="font-medium text-gray-200">Email</span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2 bg-gray-800 text-white"
            />
          </div>

          <div>
            <span className="font-medium text-gray-200">Password</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2 bg-gray-800 text-white"
            />
          </div>

          {loading ? (
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Login
            </Button>
          )}

          <span className="text-center text-gray-300">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-yellow-400 hover:underline">
              Signup
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}
