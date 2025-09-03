import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm font-light text-gray-400">
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <span href="#" className="hover:underline">
          About
        </span>
        <span href="#" className="hover:underline">
          Help
        </span>
        <Link to={"/FeatureAndFeedback"}>
          <span href="#" className="hover:underline">
            FeatureAndFeedback
          </span>
        </Link>
        <span href="#" className="hover:underline">
          Press
        </span>
        <span href="#" className="hover:underline">
          API
        </span>
        <span href="#" className="hover:underline">
          Jobs
        </span>
        <span href="#" className="hover:underline">
          Privacy
        </span>
        <span href="#" className="hover:underline">
          Terms
        </span>
        <span href="#" className="hover:underline">
          Locations
        </span>
        <span href="#" className="hover:underline">
          Language
        </span>
        <span href="#" className="hover:underline">
          Linkly Verified
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        © 2025 Linkly from Linkly author
      </p>
    </footer>
  );
}
