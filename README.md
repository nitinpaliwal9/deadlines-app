# Deadlines App (deadlines.hustlehackai.in)

> A targeted notification and tracking system designed to ensure students never miss critical exam, form, or assignment deadlines.

## Overview
**Deadlines App** is a specialized tracking platform built to solve the friction of fragmented academic notifications. Focused initially on IGNOU students, it monitors official notices, filters out irrelevant noise, and dispatches configurable reminders (7-day, 3-day, 1-day alerts) via email or WhatsApp so students never lose months to missed forms.

## Tech Stack
* **Frontend / UI:** JavaScript, modern web framework architecture, responsive styling
* **Authentication:** Secure user sign-in via Google OAuth and Magic Link authentication flows
* **Dashboard Logic:** Course and semester personalization, official source link tracking, and interactive "Mark as Done" submission management

## Key Features
* **Personalized Filtering:** Users select their specific university, semester, and course to receive only relevant alerts.
* **Verified Sources:** Direct links to official notices to eliminate rumours and unverified forwarded messages.
* **Submission Tracker:** Clean dashboard UI allowing students to track what they have completed for absolute peace of mind.
* **Configurable Reminders:** Multi-tier alerts before deadlines hit.

## Workflow
1. **Sign In:** Instant access via Google or magic link.
2. **Choose Course:** Pick university and semester for relevant notice filtering.
3. **Get Notified:** Receive automated email or WhatsApp reminders before deadlines.
4. **Mark Done:** Track submitted forms and clear tasks off the dashboard.

## Project Structure
```text
deadlines-app/
├── app/              # Core application routes and dashboard views
├── components/       # Reusable UI elements (auth, dashboard widgets, trackers)
├── public/           # Static assets
└── styles/           # Styling configurations
