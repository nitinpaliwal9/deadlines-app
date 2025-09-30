"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // ✅ Google icon

export default function AuthButtons({ after = "/dashboard" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + after },
    });
    if (error) {
      alert("Google sign-in error: " + error.message);
      setLoading(false);
    }
  }

  async function sendMagicLink(email) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + after },
    });
    if (error) {
      alert("Error sending magic link: " + error.message);
    } else {
      alert("Magic link sent — check your inbox.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Google sign-in button */}
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
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
            id="magic-email"
            placeholder="you@example.com"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() =>
              sendMagicLink(document.getElementById("magic-email").value)
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
