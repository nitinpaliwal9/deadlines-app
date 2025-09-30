// scripts/enqueuer.js
// Usage: node scripts/enqueuer.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_DEADLINES_SUPABASE_URL, process.env.DEADLINES_SUPABASE_SERVICE_ROLE_KEY);
// NOTE: This script must run server-side and use service role key for unrestricted reads/writes.

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function startOfDayUTC(d) {
  const dt = new Date(d);
  dt.setUTCHours(0,0,0,0);
  return dt.toISOString();
}

// which offsets to schedule for action deadlines
const ACTION_OFFSETS = [7, 3, 1];
const EVENT_OFFSETS = [7, 1];

async function main() {
  console.log("Enqueuer started", new Date().toISOString());

  // Step 1: get all published deadlines (published=true)
  const { data: deadlines, error } = await supabase
    .from("deadlines")
    .select("*")
    .eq("published", true);

  if (error) {
    console.error("fetch deadlines error", error);
    process.exit(1);
  }

  // Step 2: get subscribed users (use user_profiles if exists, else beta_signups)
  const { data: users } = await supabase
    .from("user_profiles")
    .select("email, course")
    .eq("subscribed", true);

  // fallback: if no user_profiles table or empty, try beta_signups
  let userList = users || [];
  if (!userList || userList.length === 0) {
    const { data: bs } = await supabase
      .from("beta_signups")
      .select("email, course");
    userList = bs || [];
  }

  console.log("Users to consider:", userList.length);

  const now = new Date();

  for (const dl of deadlines) {
    // choose date basis
    const targetDates = [];
    if (dl.end_date) {
      // action deadline types
      const end = dl.end_date;
      ACTION_OFFSETS.forEach((offset) => {
        const sendAt = addDays(end, -offset);
        targetDates.push({ sendAt, offset });
      });
    }
    if (dl.start_date) {
      EVENT_OFFSETS.forEach((offset) => {
        const sendAt = addDays(dl.start_date, -offset);
        targetDates.push({ sendAt, offset });
      });
    }
    // remove past sends (we want future or today)
    const futureDates = targetDates.filter(td => new Date(td.sendAt) >= new Date(startOfDayUTC(now)));

    for (const td of futureDates) {
      // compute send_at as 09:00 IST (04:30 UTC) — adjust if needed
      const sendAt = new Date(td.sendAt);
      // set time 04:30:00Z (9:00 IST). Use timezone free approach
      sendAt.setUTCHours(4, 30, 0, 0);

      // pick users with matching course
      const matchedUsers = userList.filter(u => (u.course || "").trim() === (dl.course || "").trim());
      for (const u of matchedUsers) {
        try {
          // upsert into reminder_queue, avoid duplicates because unique index exists
          const { error: insErr } = await supabase
            .from("reminder_queue")
            .insert([{
              email: u.email,
              deadline_id: dl.id,
              send_at: sendAt.toISOString(),
              channel: 'email',
            }], { upsert: true });

          if (insErr) {
            // ignore unique-violation style errors; log others
            console.error("insert error", insErr);
          } else {
            console.log(`Enqueued ${u.email} -> ${dl.title} at ${sendAt.toISOString()}`);
          }
        } catch (e) {
          console.error("enqueue exception", e);
        }
      } // users
    } // dates
  } // deadlines

  console.log("Enqueuer finished");
  process.exit(0);
}

main();
