"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

/**
 * Supabase OAuth callback handler.
 *
 * Supabase / Google redirect back to:
 *   https://your-site/auth/v1/callback/<whatever>#access_token=...
 *
 * This page:
 * - tries to let supabase parse the URL fragment and store the session
 * - then redirects to /dashboard
 * - if parsing fails, it moves the fragment to /dashboard so the app can try again
 *
 * NOTE: path must be exactly app/auth/v1/callback/page.js
 */
export default function SupabaseAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Some supabase client versions provide getSessionFromUrl().
        // If available, let supabase parse the hash and store the session.
        if (typeof supabase?.auth?.getSessionFromUrl === "function") {
          setStatus("Completing sign-in with Supabase...");
          const { data, error } = await supabase.auth.getSessionFromUrl({
            // storeSession true means supabase will persist the session in local storage/cookies
            storeSession: true,
          });

          if (error) {
            console.error("getSessionFromUrl error:", error);
            // fallback: move fragment to /dashboard and let client handle it there
            window.location.replace("/dashboard" + window.location.hash);
            return;
          }

          // success -> go to dashboard (remove the callback path)
          window.location.replace("/dashboard");
          return;
        }

        // If getSessionFromUrl is not present, fallback:
        // 1) attempt a safe redirect to /dashboard while preserving the hash
        // so client code on /dashboard (or supabase client initialiser) can pick up the fragment.
        console.warn("supabase.auth.getSessionFromUrl not found — falling back to fragment move.");
        window.location.replace("/dashboard" + window.location.hash);
      } catch (err) {
        console.error("Callback handling failed:", err);
        // last resort: still redirect to dashboard with fragment
        window.location.replace("/dashboard" + window.location.hash);
      }
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow text-center">
        <h3 className="font-semibold mb-2">Signing you in…</h3>
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </div>
  );
}
