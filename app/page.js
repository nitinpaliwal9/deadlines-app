"use client";

import Head from "next/head";
import AuthButtons from "../components/AuthButtons";

export default function Home() {
  return (
    <>
      <Head>
        <title>Deadlines — Never miss an exam date</title>
        <meta
          name="description"
          content="Personalized exam & submission reminders for students. Start with IGNOU."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
        {/* HERO */}
        <header className="max-w-7xl mx-auto px-6 pt-6 pb-14">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left column */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium shadow-sm mb-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-indigo-700" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Beta • IGNOU focus
              </span>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
                Never miss an exam or submission deadline again.
              </h1>

              <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                Personalized reminders for your university, semester &amp; course. We monitor official notices and send you only the alerts that matter — so you never lose months to missed forms.
              </p>

              <div className="flex flex-wrap gap-4 items-center">
                <a href="#signup" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v6l4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Join Beta — it&apos;s free
                </a>

                <a href="#how" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-100 transition">
                  Learn how it works
                </a>
              </div>

              {/* Features */}
              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-xl">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Reliable reminders</div>
                    <div className="text-sm text-gray-700">7d / 3d / 1d — configurable alerts so you actually submit on time.</div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Official sources</div>
                    <div className="text-sm text-gray-700">We link directly to official notices — no rumours, no forwarded messages.</div>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mark done</div>
                    <div className="text-sm text-gray-700">Track what you&apos;ve submitted. Peace of mind — and a clean dashboard.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - auth card */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -left-8 -top-8 w-48 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl opacity-70 transform rotate-12 blur-3xl" />
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Get early access</h3>
                  <p className="text-sm text-gray-700 mb-6">Sign in with Google or use a magic link. You&apos;ll land in a dashboard where you pick your course and get reminders.</p>

                  <div className="space-y-4">
                    <AuthButtons after="/dashboard" />
                  </div>

                  <div className="mt-6 text-xs text-gray-500">By signing up you agree to our <a href="#" className="text-indigo-600">Terms</a> and <a href="#" className="text-indigo-600">Privacy policy</a>.</div>
                </div>

                <div className="mt-6 text-sm text-gray-600">Tip: paste this in your IGNOU groups — first testers get free premium.</div>
              </div>
            </div>
          </div>
        </header>

        {/* HOW IT WORKS */}
        <section id="how" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-white rounded-2xl shadow-lg p-10 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">How it works</h3>
              <p className="text-gray-700">Quick flow — sign in, pick your course, get reminders. We do the rest.</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">1</div>
                <div>
                  <div className="font-semibold text-gray-900">Sign in</div>
                  <div className="text-sm text-gray-700">Google or magic link — instant access.</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">2</div>
                <div>
                  <div className="font-semibold text-gray-900">Choose course</div>
                  <div className="text-sm text-gray-700">Pick your university &amp; semester so we filter only relevant notices.</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">3</div>
                <div>
                  <div className="font-semibold text-gray-900">Get notified</div>
                  <div className="text-sm text-gray-700">Email / WhatsApp reminders before deadlines — configurable.</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-700">4</div>
                <div>
                  <div className="font-semibold text-gray-900">Mark done</div>
                  <div className="text-sm text-gray-700">Track which forms you submitted — no more guesswork.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <div className="max-w-7xl mx-auto px-6 pb-28">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
            <div>
              <h3 className="text-2xl font-bold">Stop losing months. Start tracking.</h3>
              <p className="mt-2 text-sm opacity-90">Join the beta — get early access and lifetime perks for first testers.</p>
            </div>
            <div>
              <a href="#signup" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold hover:opacity-95">Join Beta — it&apos;s free</a>
            </div>
          </div>
        </div>

        <footer className="text-center py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} HustleHack AI — deadlines.hustlehackai.in
        </footer>
      </div>
    </>
  );
}
