"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";

/**
 * Catch-all Supabase OAuth callback handler.
 * File: app/auth/v1/callback/[...slug]/page.js
 *
 * Matches:
 *  - /auth/v1/callback
 *  - /auth/v1/callback/dashboard
 *  - /auth/v1/callback/anything/else
 *
 * Behavior: try supabase.auth.getSessionFromUrl(), fallback to moving hash;
 * then redirect to /dashboard or /profile (if no profile).
 */

export default function SupabaseCallbackCatchAll() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign-in...");

  useEffect(() => {
    async function processCallback() {
      try {
        setStatus("Processing OAuth response...");

        // Preferred: have supabase parse & store the session for us
        if (supabase && typeof supabase.auth?.getSessionFromUrl === "function") {
          const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            console.warn("getSessionFromUrl returned error:", error);
          } else {
            console.log("Session created via getSessionFromUrl:", data);
          }
        } else {
          // Fallback: parse hash fragment manually and set session (older clients)
          const hash = window.location.hash || "";
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token) {
            setStatus("Storing session...");
            if (typeof supabase.auth?.setSession === "function") {
              await supabase.auth.setSession({ access_token, refresh_token });
              console.log("Session set via setSession fallback.");
            } else {
              console.warn("supabase.auth.setSession not available — cannot store session programmatically.");
            }
          } else {
            console.warn("No access_token in fragment — skipping manual setSession fallback.");
          }
        }

        // Verify user & choose destination
        setStatus("Verifying user...");
        let user = null;
        try {
          const { data: userData, error: getUserErr } = await supabase.auth.getUser();
          if (getUserErr) {
            console.warn("supabase.auth.getUser error:", getUserErr);
          } else {
            user = userData?.user ?? userData;
          }
        } catch (e) {
          console.warn("getUser threw:", e);
        }

        let destination = "/dashboard";

        if (user && user.email) {
          setStatus("Checking profile...");
          try {
            const { data: rows, error: qerr } = await supabase
              .from("user_profiles")
              .select("id")
              .eq("email", user.email)
              .limit(1);

            if (qerr) {
              console.warn("profile lookup error:", qerr);
            } else {
              destination = (!rows || rows.length === 0) ? "/profile" : "/dashboard";
            }
          } catch (err) {
            console.warn("profile check threw:", err);
          }
        }

        setStatus("Finalizing...");
        // Clean redirect (router.replace avoids history noise)
        router.replace(destination);
      } catch (err) {
        console.error("Callback handler failed:", err);
        // fallback: forward fragment to dashboard so client-side code can still catch it
        const frag = window.location.hash || "";
        window.location.replace("/dashboard" + frag);
      }
    }

    if (typeof window !== "undefined") processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h3 className="font-semibold mb-2">Signing you in…</h3>
        <p className="text-sm text-gray-600">{status}</p>
        <p className="text-xs text-gray-400 mt-3">If you are not redirected automatically, <a href="/dashboard" className="text-blue-600">click here</a>.</p>
      </div>
    </div>
  );
}
