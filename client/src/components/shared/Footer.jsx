import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { to: "/about", label: "About" },
    { to: "/help", label: "Help" },
    { to: "/feature-and-feedback", label: "Features & Feedback" },
    { to: "/press", label: "Press" },
    { to: "/api", label: "API" },
    { to: "/jobs", label: "Jobs" },
    { to: "/privacy", label: "Privacy" },
    { to: "/terms", label: "Terms" },
    { to: "/locations", label: "Locations" },
    { to: "/language", label: "Language" },
    { to: "/verified", label: "Net-ly Verified" },
  ];

  return (
    <footer className="w-full py-6 text-center text-xs font-normal text-zinc-500">
      <div className="flex flex-wrap justify-center items-center gap-x-3.5 gap-y-2 mb-3 px-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-zinc-300 hover:underline transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-zinc-600 mt-2">
        &copy; {currentYear} Net-ly from Net-ly team
      </p>
    </footer>
  );
}
