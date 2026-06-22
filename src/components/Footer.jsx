
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#E0FEF9] text-gray-700 border-t border-gray-200">
      <div className=" max-w-7xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm">
          Developed By —{" "}
          <a
            href="https://facebook.com/banrayndox.7"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-blue-600 transition"
          >
            Rakib B
          </a>
        </p>

        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {/* Facebook */}
          <a
            href="https://facebook.com/banrayndox.7"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <svg
              fill="currentColor"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 transition"
          >
            <svg
              fill="currentColor"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

