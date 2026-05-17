"use client";

interface TradesToolbarProps {

  searchQuery: string;

  setSearchQuery: (
    value: string
  ) => void;

  statusFilter: string;

  setStatusFilter: (
    value: string
  ) => void;

  sideFilter: string;

  setSideFilter: (
    value: string
  ) => void;

  assetFilter: string;

  setAssetFilter: (
    value: string
  ) => void;
}

export default function TradesToolbar({

  searchQuery,
  setSearchQuery,

  statusFilter,
  setStatusFilter,

  sideFilter,
  setSideFilter,

  assetFilter,
  setAssetFilter,

}: TradesToolbarProps) {

  // =================================================
  // ACTIVE FILTERS
  // =================================================

  const activeFilters = [

    statusFilter !== "ALL"
      ? statusFilter
      : null,

    sideFilter !== "ALL"
      ? sideFilter
      : null,

    assetFilter !== "ALL"
      ? assetFilter
      : null,

  ].filter(Boolean);

  // =================================================
  // RESET
  // =================================================

  const handleReset = () => {

    setSearchQuery("");

    setStatusFilter("ALL");

    setSideFilter("ALL");

    setAssetFilter("ALL");
  };

  return (

    <>
    
      <div className="ml-10 mr-10 rounded-[28px] border border-white/[0.05] bg-[#071427] p-6 shadow-[0_0_50px_rgba(0,0,0,0.22)]">

        {/* ================================================= */}
        {/* TOP ROW */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center justify-end gap-4">

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="w-[360px]">

            <input
              type="text"
              placeholder="Search ticker, account, date..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="h-[50px] w-full rounded-2xl border border-white/[0.06] bg-[#0b1220] px-5 text-[14px] font-medium text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40"
            />
          </div>

          {/* ================================================= */}
          {/* STATUS FILTER */}
          {/* ================================================= */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="h-[50px] min-w-[140px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="WIN">
              Win
            </option>

            <option value="LOSS">
              Loss
            </option>

            <option value="OPEN">
              Open
            </option>
          </select>

          {/* ================================================= */}
          {/* SIDE FILTER */}
          {/* ================================================= */}

          <select
            value={sideFilter}
            onChange={(e) =>
              setSideFilter(
                e.target.value
              )
            }
            className="h-[50px] min-w-[140px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Sides
            </option>

            <option value="LONG">
              Long
            </option>

            <option value="SHORT">
              Short
            </option>
          </select>

          {/* ================================================= */}
          {/* ASSET FILTER */}
          {/* ================================================= */}

          <select
            value={assetFilter}
            onChange={(e) =>
              setAssetFilter(
                e.target.value
              )
            }
            className="h-[50px] min-w-[160px] rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 text-[13px] font-semibold text-slate-300 outline-none transition-all focus:border-blue-500/40"
          >
            <option value="ALL">
              All Assets
            </option>

            <option value="Futures">
              Futures
            </option>

            <option value="Options">
              Options
            </option>

            <option value="Stocks">
              Stocks
            </option>

            <option value="Forex">
              Forex
            </option>
          </select>

          {/* ================================================= */}
          {/* RESET */}
          {/* ================================================= */}

          <div className="w-[110px] flex justify-center">

            <button
              onClick={handleReset}
              className="h-[50px] w-full rounded-2xl border border-red-500/15 bg-red-500/10 px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-red-400 transition-all hover:bg-red-500/15"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* ACTIVE FILTERS */}
        {/* ================================================= */}

        {(activeFilters.length > 0 ||
          searchQuery) && (

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.05] pt-5">

            {/* SEARCH PILL */}

            {searchQuery && (

              <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-[8px]">

                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-400">
                  Search: {searchQuery}
                </span>
              </div>
            )}

            {/* FILTER PILLS */}

            {activeFilters.map(
              (filter) => (

                <div
                  key={filter}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-[8px]"
                >

                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                    {filter}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* OPTICAL SPACING */}
      {/* ================================================= */}

      <div className="h-4 opacity-0" />

    </>
  );
}