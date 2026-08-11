"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [state, setState] = useState<"confirming" | "confirmed" | "error">("confirming");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    (async () => {
      try {
        // transactionId is the Stripe Checkout session ID returned on redirect.
        await paymentService.confirm({ transactionId: sessionId, status: "COMPLETED" });
        if (!cancelled) {
          setState("confirmed");
        }
      } catch (confirmError) {
        if (!cancelled) {
          setState("error");
          setMessage(confirmError instanceof Error ? confirmError.message : "Could not confirm the payment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="surface-card w-full p-8 text-center">
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Payment not confirmed</h1>
          <p className="mt-3 text-sm leading-7 text-text-muted">Missing session ID. The payment may not have gone through.</p>
          <Link href="/payments" className="btn-primary mt-6">
            Go to payments
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="surface-card w-full p-8 text-center">
        {state === "confirming" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">Confirming your payment</h1>
            <p className="mt-3 text-sm text-text-muted">Please wait a moment while we verify your transaction.</p>
          </>
        )}

        {state === "confirmed" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Payment successful</h1>
            <p className="mt-3 text-sm leading-7 text-text-muted">
              Thank you! Your payment has been confirmed. Your booking is now marked as paid.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
              <Sparkles className="h-4 w-4" /> Your technician can now start the job
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/bookings" className="btn-primary">
                View my bookings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/services" className="btn-secondary">
                Book another service
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Payment not confirmed</h1>
            <p className="mt-3 text-sm leading-7 text-text-muted">{message || "There was a problem confirming your payment."}</p>
            <Link href="/payments" className="btn-primary mt-6">
              Go to payments
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8"><div className="surface-card h-56 w-full animate-pulse" /></main>}>
      <SuccessContent />
    </Suspense>
  );
}
