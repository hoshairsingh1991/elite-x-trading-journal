import Link from "next/link";
import Image from "next/image";

export default function MarketingFooter() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#030712] py-10 text-slate-400">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand Info */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/landing" className="relative h-8 w-32">
              <Image
                src="/logo.svg"
                alt="Elite X Trading OS"
                fill
                className="object-contain object-left"
              />
            </Link>
            <p className="text-xs text-slate-500">
              Institutional Trading OS &amp; Business Intelligence Platform
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Modules:</span>
            <span className="text-slate-400">Dashboard</span>
            <span className="text-slate-400">Trade History</span>
            <span className="text-slate-400">Expenses</span>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-slate-500 md:text-right">
            <p>&copy; {new Date().getFullYear()} Elite X. All rights reserved.</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Deterministic Accounting &amp; Institutional Analytics
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
