"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paymentService } from "@/services/payment.service";
import { PaymentItem } from "@/types";
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";

function getMeta(payment: PaymentItem) {
  const extended = payment as PaymentItem & { transactionId?: string; method?: string; provider?: string; paidAt?: string; currency?: string };
  let paidAt = extended.paidAt || "";
  if (paidAt) {
    try {
      const date = new Date(paidAt);
      if (!isNaN(date.getTime())) paidAt = date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      /* keep raw */
    }
  }
  return { extended, paidAt };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await paymentService.list();
      setPayments(response?.payments || response?.data || []);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          <CreditCard className="h-4 w-4" /> Payments
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Payment history.</h1>
      </section>

      <section className="mt-8 surface-card p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="surface-panel h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const { extended, paidAt } = getMeta(payment);
              return (
                <article key={payment.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-foreground">৳{payment.amount ?? 0}</p>
                    <p className="mt-1 text-sm text-text-muted">Booking #{payment.bookingId || "N/A"}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                      {extended.transactionId && <span>Tx {extended.transactionId}</span>}
                      {extended.method && <span>{extended.method}</span>}
                      {extended.provider && <span>{extended.provider}</span>}
                      {paidAt && <span>{paidAt}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-success-strong">
                      {payment.status || "PAID"}
                    </span>
                    <Link href={`/payments/${payment.id}`} className="btn-secondary text-sm">
                      View payment details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-slate-50 p-6 text-sm text-text-muted">
        <div className="inline-flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> Checkout will continue to redirect here once the payment provider is finalized.
        </div>
        <Link href="/bookings" className="mt-4 inline-flex items-center gap-2 font-semibold text-accent">Back to bookings <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}