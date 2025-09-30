// scripts/worker-send.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch"; // node 18+ has fetch builtin
const supabase = createClient(process.env.NEXT_PUBLIC_DEADLINES_SUPABASE_URL, process.env.DEADLINES_SUPABASE_SERVICE_ROLE_KEY);

// using Resend (https://resend.com) as example
const RESEND_API_KEY = process.env.RESEND_API_KEY; // set this in env

async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Deadlines <no-reply@yourdomain.com>",
      to: [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data;
}

async function main() {
  console.log("Worker started", new Date().toISOString());
  // pick pending reminders whose send_at <= now
  const now = new Date().toISOString();
  const { data: reminders, error } = await supabase
    .from("reminder_queue")
    .select("id, email, deadline_id, send_at, attempts")
    .lte("send_at", now)
    .eq("status", "pending")
    .limit(50);

  if (error) {
    console.error("fetch reminder_queue error", error);
    process.exit(1);
  }

  if (!reminders || reminders.length === 0) {
    console.log("No reminders to send.");
    process.exit(0);
  }

  for (const r of reminders) {
    try {
      // fetch deadline details
      const { data: dl } = await supabase
        .from("deadlines")
        .select("*")
        .eq("id", r.deadline_id)
        .single();

      if (!dl) {
        console.warn("deadline not found for reminder", r.id);
        await supabase.from("reminder_queue").update({ status: 'failed', last_error: 'deadline not found' }).eq('id', r.id);
        continue;
      }

      // craft email
      const subject = `Reminder: ${dl.course} — ${dl.title} (${new Date(dl.end_date || dl.start_date || dl.created_at).toLocaleDateString()})`;
      const html = `
        <p>Hi,</p>
        <p>Reminder: <strong>${dl.title}</strong> for <strong>${dl.course}</strong>.</p>
        ${dl.end_date ? `<p>Last date: ${new Date(dl.end_date).toLocaleDateString()}</p>` : ''}
        ${dl.start_date ? `<p>Starts: ${new Date(dl.start_date).toLocaleDateString()}</p>` : ''}
        ${dl.official_link ? `<p>Official link: <a href="${dl.official_link}">${dl.official_link}</a></p>` : ''}
        <p>If you've completed this, mark it done in your dashboard: <a href="${process.env.APP_BASE_URL || 'https://your-domain'}${'/dashboard'}">Open dashboard</a></p>
        <p>— Deadlines</p>
      `;

      // send
      const resp = await sendEmail(r.email, subject, html);
      // mark as sent
      await supabase.from("reminder_queue").update({ status: 'sent', attempts: r.attempts + 1 }).eq('id', r.id);
      console.log("Sent reminder", r.email, r.id);
    } catch (err) {
      console.error("Send error for reminder", r.id, err.message || err);
      // increment attempts, mark failed after 3 tries
      const attempts = (r.attempts || 0) + 1;
      const status = attempts >= 3 ? 'failed' : 'pending';
      await supabase.from("reminder_queue").update({ attempts, last_error: err.message, status }).eq('id', r.id);
    }
  }

  console.log("Worker finished");
  process.exit(0);
}

main();
