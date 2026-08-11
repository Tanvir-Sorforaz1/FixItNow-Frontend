import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="surface-card w-full p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger-strong">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">Access restricted.</h1>
        <p className="mt-3 text-sm text-text-muted">You do not have permission to view this page. Sign in with the right role and try again.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn-primary">Go to login</Link>
          <Link href="/" className="btn-secondary">Back to home</Link>
        </div>
      </section>
    </main>
  );
}