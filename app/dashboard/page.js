// app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * Dashboard — improved contrast + readability + type badges
 */

const typeBadge = (type) => {
  switch ((type || "").toLowerCase()) {
    case "exam_form":
    case "exam":
      return "bg-blue-100 text-blue-800";
    case "assignment":
      return "bg-yellow-100 text-yellow-800";
    case "fee":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("IGNOU • BCA • 2nd Year");
  const [deadlines, setDeadlines] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { deadline_id: 'done'|'pending' }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("hh_deadlines_email");
    if (saved) setEmail(saved);
    fetchDeadlines();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (email && course) {
      loadStatuses(email, course);
    }
    // eslint-disable-next-line
  }, [email, course, deadlines]);

  async function fetchDeadlines() {
    setLoading(true);
    setMessage("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("deadlines")
        .select("*")
        .gte("end_date", today)
        .order("end_date", { ascending: true })
        .limit(500);

      if (error) {
        console.error("fetch deadlines error", error);
        setMessage("Unable to load deadlines. Try again later.");
        setDeadlines([]);
      } else {
        setDeadlines(data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error loading deadlines.");
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStatuses(emailToLoad, courseToLoad) {
    if (!emailToLoad) return;
    setMessage("");
    try {
      const deadlineIds = (deadlines || [])
        .filter((d) => d.course === courseToLoad)
        .map((d) => d.id);

      if (deadlineIds.length === 0) {
        setStatusMap({});
        return;
      }

      const { data, error } = await supabase
        .from("user_deadline_status")
        .select("deadline_id, status")
        .in("deadline_id", deadlineIds)
        .eq("email", emailToLoad);

      if (error) {
        console.error("loadStatuses", error);
        setMessage("Could not load your marks.");
      } else {
        const map = {};
        (data || []).forEach((r) => {
          map[r.deadline_id] = r.status;
        });
        setStatusMap(map);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEmail(e) {
    e.preventDefault();
    if (!email) {
      setMessage("Enter a valid email.");
      return;
    }
    localStorage.setItem("hh_deadlines_email", email);
    setMessage("Email saved locally.");
    await loadStatuses(email, course);
  }

  async function toggleDone(deadline) {
    if (!email) {
      setMessage("Save your email first (top left) to mark deadlines.");
      return;
    }
    const deadline_id = deadline.id;
    const current = statusMap[deadline_id] || "pending";
    const newStatus = current === "done" ? "pending" : "done";
    // optimistic update
    setStatusMap((s) => ({ ...s, [deadline_id]: newStatus }));

    const { error } = await supabase.from("user_deadline_status").upsert(
      {
        email,
        deadline_id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "(email, deadline_id)" }
    );

    if (error) {
      console.error("toggle error", error);
      setMessage("Could not update status. Try again.");
      setStatusMap((s) => ({ ...s, [deadline_id]: current })); // revert
    } else {
      setMessage(newStatus === "done" ? "Marked done ✅" : "Marked pending");
    }
  }

  // filter deadlines by selected course
  const visible = deadlines.filter((d) => d.course === course);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your deadlines</h1>
            <p className="text-sm text-gray-700 mt-1">
              Stay on top of submissions & exam forms — set your email and get reminders.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <form onSubmit={handleSaveEmail} className="flex gap-3 items-center flex-col sm:flex-row">
              <div className="w-full sm:w-64">
                <label className="text-sm font-medium text-gray-800">Your email</label>
                <input
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="w-full sm:w-56">
                <label className="text-sm font-medium text-gray-800">Course</label>
                <select
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option>IGNOU • BCA • 2nd Year</option>
                  <option>IGNOU • BCA • 1st Year</option>
                  <option>IGNOU • BA • 1st Year</option>
                </select>
              </div>

              <div className="mt-3 sm:mt-0">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-3 text-sm font-medium text-gray-800">{message}</div>
            )}
          </div>
        </header>

        <section className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Upcoming deadlines <span className="text-sm text-gray-600">({visible.length})</span>
          </h2>

          {loading && <p className="text-gray-700">Loading...</p>}

          {!loading && visible.length === 0 && (
            <p className="text-gray-700">No upcoming deadlines for this course. Admins can add them from /admin.</p>
          )}

          <ul className="space-y-4 mt-3">
            {visible.map((d) => {
              const stat = statusMap[d.id] || "pending";
              return (
                <li
                  key={d.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start justify-between bg-white hover:shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${typeBadge(d.type)}`}>
                        {d.type || "Other"}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">{d.title}</div>
                        <div className="text-sm text-gray-700 mt-1">{d.course} • due <span className="font-medium">{new Date(d.end_date).toLocaleDateString()}</span></div>
                      </div>
                    </div>

                    {d.notes && <p className="mt-3 text-sm text-gray-800">{d.notes}</p>}

                    {d.official_link && (
                      <a
                        className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                        href={d.official_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official link
                      </a>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end gap-3">
                    <button
                      onClick={() => toggleDone(d)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        stat === "done"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {stat === "done" ? "Done ✓" : "Mark done"}
                    </button>

                    <div className="text-xs text-gray-500">Added: {d.created_at ? new Date(d.created_at).toLocaleDateString() : "-"}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
