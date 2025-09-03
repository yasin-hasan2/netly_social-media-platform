import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FeatureAndFeedback() {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: feedback }),
      });

      if (res.ok) {
        setSuccess(true);
        setFeedback("");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // Feature data
  const features = [
    {
      title: "Follow & Unfollow System",
      desc: "Connect with others instantly. Manage your followers and following with ease in real time.",
      img: "/images/follow.png",
    },
    {
      title: "Store System",
      desc: "Buy, sell, and showcase products directly inside the platform with a seamless shopping experience.",
      img: "/images/store.png",
    },
    {
      title: "Improved Inputs",
      desc: "Enjoy smooth and modern inputs for comments, messages, and captions with better design and UX.",
      img: "/images/improve.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col items-center px-6 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl text-center mb-16"
      >
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">
          Features & Feedback
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Discover what’s here today, see what’s coming tomorrow, and share your
          thoughts with us.
        </p>

        {/* Get Started Button */}
        <Link to="/" className="inline-block mt-6">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition">
            Get Started
          </button>
        </Link>
      </motion.div>

      {/* Features Sections */}
      <div className="flex flex-col gap-20 w-full max-w-6xl">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col md:flex-row items-center bg-white rounded-2xl  overflow-hidden hover:shadow-2xl transition group ${
              i % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image */}
            <div className="w-full md:w-1/2 h-64 md:h-80 overflow-hidden">
              <img
                src={feature.img}
                alt={feature.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>

            {/* Text */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition">
                {feature.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl mt-20 bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Share Your Feedback
        </h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback..."
          className="w-full text-black h-28 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSendFeedback}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Feedback"}
        </button>

        {success && (
          <p className="text-green-600 mt-3 font-medium">
            ✅ Feedback sent successfully!
          </p>
        )}
      </motion.div>
    </div>
  );
}
