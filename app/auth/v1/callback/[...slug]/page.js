"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

/**
 * Catch-all Supabase OAuth callback handler.
 *
 * Matches:
 *  - /auth/v1/callback
 *  - /auth/v1/callback/dashboard
 *  - /auth/v1/callback/anything/else
 *
 * Behavior:
 * 1. Try supabase.auth.getSessionFromUrl() (v2 helper). If available, use it to store session.
 * 2. If not available, try to parse access_token/refresh_token from window.location.hash and call setSession().
 * 3. Once session exists, get user and check for a profile in `user_profiles` table.
 *    - If no profile found, redirect to /profile (you can change this route).
 *    - Otherwise redirect to /dashboard.
 * 4. If anything fails, forward the fragment to /dashboard so your client code can still pick it up.
 */

export default function SupabaseCallbackCatchAll() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign-in...");

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      try {
        setStatus("Processing OAuth response...");

        // 1) Preferred: let supabase parse and persist the session
        if (supabase && typeof supabase.auth?.getSessionFromUrl === "function") {
          const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            // Not fatal — continue to fallback
            console.warn("getSessionFromUrl returned error:", error);
          } else {
            console.log("Session created via getSessionFromUrl:", data);
          }
        } else {
          // 2) Fallback: parse hash fragment manually and set session (for older clients)
          const hash = window.location.hash || "";
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token) {
            setStatus("Storing session...");
            // supabase v2 has setSession
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

        // 3) Get current user (if session successfully stored)
        setStatus("Verifying user...");
        let user = null;
        try {
          const { data: userData, error: getUserErr } = await supabase.auth.getUser();
          if (getUserErr) {
            console.warn("supabase.auth.getUser error:", getUserErr);
          } else {
            user = userData?.user ?? userData; // adapt to possible shapes
          }
        } catch (e) {
          console.warn("getUser threw:", e);
        }

        // default destination
        let destination = "/dashboard";

        // If we found a user email, try to see if user_profiles exists and has a record
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
              // If table doesn't exist or query fails, just go to dashboard
            } else {
              if (!rows || rows.length === 0) {
                // No profile found -> route to /profile for first-time setup
                destination = "/profile";
              } else {
                destination = "/dashboard";
              }
            }
          } catch (err) {
            console.warn("profile check threw:", err);
          }
        } else {
          // if no user, still go to dashboard; dashboard client may handle session from hash
          destination = "/dashboard";
        }

        // final redirect (clean)
        setStatus("Finalizing...");
        // If there's a hash with tokens present, some setups prefer to preserve them; but
        // we assume session is stored already. Redirect without hash for cleanliness.
        router.replace(destination);
      } catch (err) {
        console.error("Callback handler failed:", err);
        // fallback: forward fragment to dashboard so client-side code can still catch it
        const frag = window.location.hash || "";
        const forward = "/dashboard" + frag;
        window.location.replace(forward);
      }
    }

    // run only on client
    if (typeof window !== "undefined") {
      processCallback();
    }

    return () => {
      mounted = false;
    };
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
