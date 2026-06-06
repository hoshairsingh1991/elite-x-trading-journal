export default function AccountCurrencyCard() {
  return (
    <div
      className="
        h-[360px]
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
        p-6
      "
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <h3 className="text-[15px] font-semibold text-white">
        Account & Currency
      </h3>

      {/* ================================================= */}
      {/* ACCOUNT DETAILS */}
      {/* ================================================= */}

      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-slate-400">
            Base Currency
          </span>

          <div className="h-5 w-12 rounded bg-white/[0.04]" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[14px] text-slate-400">
            Account Value (USD)
          </span>

          <div className="h-5 w-24 rounded bg-white/[0.04]" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[14px] text-slate-400">
            Today's P&L
          </span>

          <div className="h-5 w-20 rounded bg-white/[0.04]" />
        </div>
      </div>

      {/* ================================================= */}
      {/* CURRENCIES */}
      {/* ================================================= */}

      <div className="mt-8">
        <div className="mb-3 text-[14px] text-slate-400">
          Currencies Traded
        </div>

        <div className="flex flex-wrap gap-2">
          {["USD", "CAD", "EUR", "GBP", "JPY"].map(
            (currency) => (
              <div
                key={currency}
                className="
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.03]
                  px-3
                  py-1.5
                  text-[12px]
                  text-slate-300
                "
              >
                {currency}
              </div>
            )
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* FX STATUS */}
      {/* ================================================= */}

      <div className="mt-8 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

        <span className="text-[13px] text-slate-400">
          FX Conversion:
        </span>

        <span className="text-[13px] font-medium text-emerald-400">
          Enabled
        </span>
      </div>
    </div>
  );
}