import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-slate-900">
          Welcome to TRUS.AI
        </h1>
        <p className="mb-8 text-xl text-slate-600">
          Transparent Responsible Unified System for AI in Banking
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/applications"
            className="rounded-lg bg-primary px-6 py-3 text-white shadow-lg transition hover:bg-primary/90"
          >
            Loan Decisions
          </Link>
          <Link
            href="/consent"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            Consent Center
          </Link>
          <Link
            href="/audit"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            Audit Trail
          </Link>
        </div>
      </div>
    </div>
  );
}

