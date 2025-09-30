"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export default function AuthButtons({ after = "/dashboard" }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Resolve redirect base:
  // Prefer a build-time public var (set on Vercel): NEXT_PUBLIC_APP_URL
  // Fallback to runtime origin (useful for local dev).
  function getRedirectBase() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ""); // strip trailing slash
    }
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    // As a last resort, empty string (will likely fail but avoids crash)
    return "";
  }

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const redirectTo = getRedirectBase() + after;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        console.error("Google sign-in error", error);
        alert("Google sign-in error: " + error.message);
        setLoading(false);
      } else {
        // On success, Supabase will redirect the browser to Google's auth page.
        // Nothing more to do here.
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error during Google sign-in.");
      setLoading(false);
    }
  }

  async function sendMagicLink(inputEmail) {
    const normalized = (inputEmail || email || "").trim();
    if (!normalized) {
      alert("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = getRedirectBase() + after;
      const { data, error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) {
        console.error("Magic link error", error);
        alert("Error sending magic link: " + error.message);
      } else {
        // data may contain info — just inform the user.
        alert("Magic link sent — check your inbox.");
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error sending magic link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Google sign-in button */}
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition disabled:opacity-60"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="font-medium text-gray-800">Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="text-xs text-gray-400">or</div>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Magic link input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Enter email for magic link
        </label>
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => sendMagicLink()}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
