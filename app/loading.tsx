export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        <h2 className="text-xl font-semibold text-slate-800">Loading FixItNow</h2>
        <p className="mt-2 text-sm text-slate-500">Preparing your service marketplace experience.</p>
      </div>
    </div>
  );
}
