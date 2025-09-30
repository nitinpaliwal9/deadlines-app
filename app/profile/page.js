"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

/**
 * Profile page:
 * - loads supabase auth user
 * - loads user_profiles row (if exists)
 * - allows editing name, course, subscribed flag
 * - upserts into user_profiles and redirects to /dashboard
 */

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    course: "IGNOU • BCA • 2nd Year",
    subscribed: true,
  });

  // courses list — extend later
  const COURSES = [
    "IGNOU • BCA • 1st Year",
    "IGNOU • BCA • 2nd Year",
    "IGNOU • BA • 1st Year",
  ];

  // load auth user and profile
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setMsg("");

      try {
        // get current user
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          // not signed in
          if (mounted) {
            setMsg("You must be signed in to edit your profile.");
            setLoading(false);
          }
          return;
        }

        const user = userData.user;
        if (mounted) setUserEmail(user.email || "");

        // try to fetch profile row
        const { data: rows, error: qerr } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("email", user.email)
          .limit(1)
          .single();

        if (qerr && qerr.code !== "PGRST116") {
          // ignore 'no rows' style errors; log others
          console.warn("profile query err:", qerr);
        }

        if (rows) {
          if (mounted) {
            setForm({
              name: rows.name || "",
              course: rows.course || form.course,
              subscribed: typeof rows.subscribed === "boolean" ? rows.subscribed : true,
            });
          }
        } else {
          // no rows -> prefill email only
          if (mounted) {
            setForm((f) => ({ ...f, subscribed: true }));
          }
        }
      } catch (err) {
        console.error("profile load failed", err);
        setMsg("Could not load profile. Check console.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      if (!userEmail) {
        setMsg("No signed-in user. Please sign in first.");
        setSaving(false);
        return;
      }

      const payload = {
        email: userEmail,
        name: form.name || null,
        course: form.course,
        subscribed: form.subscribed,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(payload, { onConflict: "email" });

      if (error) {
        console.error("upsert error", error);
        setMsg("Could not save profile: " + error.message);
        setSaving(false);
        return;
      }

      // success — redirect to dashboard
      setMsg("Profile saved. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      console.error(err);
      setMsg("Unexpected error. Check console.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-40 mb-3" />
          <div className="text-sm text-gray-500">Loading profile…</div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded shadow text-center max-w-md">
          <h2 className="text-lg font-semibold mb-2">You are not signed in</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in using Google or email magic link to continue.
          </p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4">Your profile</h1>
          <p className="text-sm text-gray-600 mb-6">This is where we save your course and reminder preferences.</p>

          <form onSubmit={handleSave} className="grid gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700">Email (read-only)</label>
              <input
                readOnly
                value={userEmail}
                className="mt-1 block w-full rounded border border-gray-200 px-3 py-2 bg-gray-50 text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className="mt-1 block w-full rounded border border-gray-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">Course</label>
              <select
                value={form.course}
                onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                className="mt-1 block w-full rounded border border-gray-200 px-3 py-2"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="subscribed"
                type="checkbox"
                checked={form.subscribed}
                onChange={(e) => setForm((f) => ({ ...f, subscribed: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="subscribed" className="text-sm text-gray-700">
                Receive email reminders (you can unsubscribe anytime)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save & continue"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded border bg-white text-gray-700"
              >
                Skip for now
              </button>
            </div>

            {msg && <div className="text-sm text-gray-600 mt-2">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
