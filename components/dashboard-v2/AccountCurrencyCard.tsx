export default function AccountCurrencyCard() {
  return (
    <div
      className="
        h-[320px]
        overflow-hidden
        rounded-[22px]
        border
        border-white/[0.08]
        bg-[#081526]/80
        backdrop-blur-xl
      "
    >
      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[10px]" />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="px-8 pt-7">
        <div className="relative left-4">
          <h3 className="text-[16px] font-semibold text-white">
            Account & Currency
          </h3>

          <p className="mt-2 text-[15px] text-slate-500">
            Account configuration overview
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* ACCOUNT DETAILS */}
      {/* ================================================= */}

      <div className="mt-10 flex justify-center">
        <div className="w-[90%] space-y-6">

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
      </div>

      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[40px]" />

      {/* ================================================= */}
      {/* CURRENCIES */}
      {/* ================================================= */}

      <div className="flex justify-center">
        <div className="w-[90%]">

          <div className="mb-4 text-[14px] text-slate-400">
            Currencies Traded
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "USD",
              "CAD",
              "EUR",
              "GBP",
              "JPY",
            ].map((currency) => (
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
            ))}
          </div>

        </div>
      </div>

      {/* ===================================== */}
      {/* INVISIBLE SPACER */}
      {/* ===================================== */}

      <div className="h-[40px]" />

      {/* ================================================= */}
      {/* FX STATUS */}
      {/* ================================================= */}

      <div className="flex justify-center">
        <div className="flex w-[90%] items-center gap-2">

          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

          <span className="text-[13px] text-slate-400">
            FX Conversion:
          </span>

          <span className="text-[13px] font-medium text-emerald-400">
            Enabled
          </span>

        </div>
      </div>
    </div>
  );
}