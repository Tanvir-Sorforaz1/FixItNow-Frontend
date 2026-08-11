"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-800">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold">We could not load this page.</h1>
        <p className="mt-3 text-sm text-slate-500">Please try again or return home.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => reset()} className="rounded-full bg-cyan-500 px-4 py-2 font-medium text-white">Try again</button>
          <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-600">Back home</Link>
        </div>
      </div>
    </div>
  );
}
