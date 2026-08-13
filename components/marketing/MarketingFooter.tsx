export default function MarketingFooter() {
  return (
    <footer
      className="
        relative
        w-full
        border-t
        border-white/[0.06]
        bg-[#030712]
        h-[50px]
        text-slate-500
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          h-full
          w-full
          max-w-[1440px]
          items-center
          justify-end
          px-6
          sm:px-8
          lg:px-10
        "
      >
        {/* ================================================= */}
        {/* COPYRIGHT                                         */}
        {/* ================================================= */}

        <div
          className="
            relative
            left-[500px]
            top-[-0px]
            text-right
          "
        >
          <p className="text-[11px] text-slate-400">
            © 2026 Elite X. All rights reserved.
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            Deterministic Accounting &amp; Institutional Analytics
          </p>
        </div>
      </div>
    </footer>
  );
}