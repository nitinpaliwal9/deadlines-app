// components/Navbar.js
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7a1 1 0 011-1h3l2-3h4l2 3h3a1 1 0 011 1v2H3V7z"
                fill="white"
              />
            </svg>
          </div>
          <Link
            href="/"
            className="font-bold text-lg text-gray-800 hover:text-gray-900 transition"
          >
            Deadlines
          </Link>
        </div>

        {/* Center/Right: Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#how"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            How it works
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Admin
          </Link>

          <Link
            href="#signup"
            className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Join Beta
          </Link>
        </nav>

        {/* Mobile: only button */}
        <div className="md:hidden">
          <Link
            href="#signup"
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition"
          >
            Join
          </Link>
        </div>
      </div>
    </header>
  );
}
