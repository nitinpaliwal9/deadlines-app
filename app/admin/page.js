"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [deadlines, setDeadlines] = useState([]);
  const [form, setForm] = useState({
    title: "",
    course: "IGNOU • BCA • 2nd Year",
    type: "exam_form",
    end_date: "",
    official_link: "",
    notes: ""
  });
  const [msg, setMsg] = useState("");

  function checkPassword() {
    const ok = password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    setAuthed(ok);
    setMsg(ok ? "✅ Admin access granted." : "❌ Incorrect password.");
    if (ok) loadDeadlines();
  }

  async function loadDeadlines() {
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .order("end_date", { ascending: true });

    if (error) {
      console.error(error);
      setMsg("❌ Error loading deadlines");
    } else {
      setDeadlines(data || []);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setMsg("⏳ Saving...");
    const { error } = await supabase.from("deadlines").insert([form]);
    if (error) {
      console.error(error);
      setMsg("❌ Error: " + error.message);
    } else {
      setMsg("✅ Deadline added");
      setForm({
        title: "",
        course: "IGNOU • BCA • 2nd Year",
        type: "exam_form",
        end_date: "",
        official_link: "",
        notes: ""
      });
      loadDeadlines();
    }
  }

  if (!authed) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Admin Login</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkPassword();
          }}
          className="space-y-4"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border border-gray-300 px-3 py-2 rounded w-full text-gray-900"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
          >
            Enter
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-700">{msg}</p>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin — Deadlines</h1>

        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="bg-white p-6 rounded-xl shadow-md mb-8 grid gap-4"
        >
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
            required
          />
          <select
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
          >
            <option>IGNOU • BCA • 2nd Year</option>
            <option>IGNOU • BCA • 1st Year</option>
            <option>IGNOU • BA • 1st Year</option>
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
          >
            <option value="exam_form">Exam Form</option>
            <option value="assignment">Assignment</option>
            <option value="fee">Fee</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
            required
          />
          <input
            placeholder="Official link (optional)"
            value={form.official_link}
            onChange={(e) => setForm({ ...form, official_link: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border border-gray-300 px-3 py-2 rounded text-gray-900"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Add Deadline
            </button>
            <button
              type="button"
              onClick={loadDeadlines}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-700">{msg}</div>
        </form>

        {/* Existing deadlines */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Existing deadlines
          </h2>
          <ul className="space-y-3">
            {deadlines.map((d) => (
              <li
                key={d.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{d.title}</div>
                  <div className="text-sm text-gray-700">
                    {d.course} • due {d.end_date}
                  </div>
                  {d.official_link && (
                    <a
                      href={d.official_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm"
                    >
                      Official Link
                    </a>
                  )}
                  {d.notes && (
                    <p className="text-sm text-gray-700 mt-1">{d.notes}</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {d.created_at ? new Date(d.created_at).toLocaleString() : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
