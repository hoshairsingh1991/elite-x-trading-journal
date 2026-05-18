"use client";

interface AddTradeModalProps {

  open: boolean;

  onClose: () => void;
}

export default function AddTradeModal({

  open,
  onClose,

}: AddTradeModalProps) {

  if (!open) {

    return null;
  }

  return (

    <>
    
      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-[4px]" />

      {/* ================================================= */}
      {/* VIEWPORT */}
      {/* ================================================= */}

      <div className="fixed inset-0 z-[100] overflow-y-auto">

        {/* ================================================= */}
        {/* TOP SAFE ZONE */}
        {/* ================================================= */}

        <div className="h-[18px] opacity-0">
          spacing
        </div>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <div className="flex min-h-[calc(100vh-36px)]">

          {/* ================================================= */}
          {/* LEFT SAFE ZONE */}
          {/* ================================================= */}

          <div className="w-[18px] opacity-0">
            spacing
          </div>

          {/* ================================================= */}
          {/* CENTER */}
          {/* ================================================= */}

          <div className="flex flex-1 items-center justify-center py-10">

            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}

            <div className="relative w-full max-w-[740px] rounded-[32px] border border-white/[0.06] bg-[#071427] shadow-[0_0_80px_rgba(0,0,0,0.45)]">

              {/* ================================================= */}
              {/* TOP SAFE ZONE */}
              {/* ================================================= */}

              <div className="h-8 opacity-0">
                spacing
              </div>

              {/* ================================================= */}
              {/* HEADER WRAPPER */}
              {/* ================================================= */}

              <div className="flex items-start justify-between">

                {/* ================================================= */}
                {/* LEFT INVISIBLE SAFE ZONE */}
                {/* ================================================= */}

                <div className="w-[18px] shrink-0 opacity-0">
                  spacing
                </div>

                {/* ================================================= */}
                {/* HEADER CONTENT */}
                {/* ================================================= */}

                <div className="flex flex-1 items-start justify-between">

                  {/* ================================================= */}
                  {/* LEFT SIDE */}
                  {/* ================================================= */}

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                      Manual Trade Entry
                    </p>

                    <h2 className="mt-3 text-[34px] font-black tracking-tight text-white">
                      Add Trade
                    </h2>

                    <p className="mt-3 text-[14px] text-slate-400">
                      Create manual trade entries with institutional workflow precision.
                    </p>
                  </div>

                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="flex items-center gap-3">

                    {/* SAVE BUTTON */}

                    <button
                      className="flex h-[42px] w-[92px] items-center justify-center rounded-[12px] border border-blue-400/20 bg-blue-500/90 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-blue-400"
                    >
                      Save
                    </button>

                    {/* CLOSE BUTTON */}

                    <button
                      onClick={onClose}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220] text-[17px] font-bold text-slate-400 transition-all hover:border-white/[0.10] hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* ================================================= */}
                {/* RIGHT INVISIBLE SAFE ZONE */}
                {/* ================================================= */}

                <div className="w-[18px] shrink-0 opacity-0">
                  spacing
                </div>
              </div>

              {/* ================================================= */}
              {/* HEADER GAP */}
              {/* ================================================= */}

              <div className="h-10 opacity-0">
                spacing
              </div>

              {/* ================================================= */}
              {/* BODY SAFE ZONE */}
              {/* ================================================= */}

              <div className="px-5">

                {/* ================================================= */}
                {/* WORKSPACE */}
                {/* ================================================= */}

                <div className="rounded-[26px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(17,24,39,0.55)_0%,rgba(9,24,45,0.45)_100%)] px-6 py-8">

                  {/* ================================================= */}
                  {/* INTERNAL LEFT + RIGHT SAFE ZONES */}
                  {/* ================================================= */}

                  <div className="flex">

                    {/* ================================================= */}
                    {/* LEFT SAFE ZONE */}
                    {/* ================================================= */}

                    <div className="w-[18px] shrink-0 opacity-0">
                      spacing
                    </div>

                    {/* ================================================= */}
                    {/* MAIN CONTENT */}
                    {/* ================================================= */}

                    <div className="flex-1">

                      {/* ================================================= */}
                      {/* SECTION HEADER */}
                      {/* ================================================= */}

                      <div>

                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Trade Details
                        </p>

                        <p className="mt-2 text-[13px] text-slate-400">
                          Configure manual trade execution details and workflow metadata.
                        </p>

                        {/* ================================================= */}
                        {/* INVISIBLE SPACER */}
                        {/* ================================================= */}

                        <p className="mt-2 text-[13px] opacity-0">
                          Configure manual trade execution details and workflow metadata.
                        </p>
                      </div>

                      {/* ================================================= */}
                      {/* DIVIDER */}
                      {/* ================================================= */}

                      <div className="mt-6 h-px bg-white/[0.05]" />

                      {/* ================================================= */}
                      {/* MAIN WORKFLOW */}
                      {/* ================================================= */}

                      <div className="mt-10 flex flex-col items-center">

                        {/* ================================================= */}
                        {/* ROW 1 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-5">

                          {/* ACCOUNT */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Account
                            </p>

                            <div className="flex h-[60px] w-[240px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

                              <span className="text-[14px] font-semibold text-white">
                                Main Futures Account
                              </span>
                            </div>
                          </div>

                          {/* ASSET TYPE */}

                          <div className="flex flex-col items-center">

                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Asset Type
                            </p>

                            <div className="flex h-[60px] w-[360px] items-center justify-center gap-[6px] rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-[10px]">

                              {[
                                "Stocks",
                                "Options",
                                "Futures",
                                "Crypto",
                                "CFD",
                                "Forex",
                              ].map((item) => (

                                <button
                                  key={item}
                                  className={`flex h-[32px] min-w-[52px] items-center justify-center rounded-[10px] text-[10px] font-black uppercase tracking-[0.08em] transition-all ${
                                    item === "Futures"
                                      ? "bg-blue-500 px-[12px] text-white"
                                      : "bg-white/[0.04] px-[12px] text-slate-400 hover:bg-white/[0.08]"
                                  }`}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* ================================================= */}
                        {/* GAP */}
                        {/* ================================================= */}

                        <div className="h-10 opacity-0">
                          spacing
                        </div>

                        {/* ================================================= */}
                        {/* ROW 2 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-4">

                          {[
                            "Ticker",
                            "Trade Date",
                            "Position Side",
                            "Quantity",
                          ].map((field) => (

                            <div
                              key={field}
                              className="flex flex-col items-center"
                            >

                              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                {field}
                              </p>

                              {field === "Position Side" ? (

                                <div className="flex h-[60px] w-[190px] items-center justify-center gap-4 rounded-[16px] border border-white/[0.06] bg-[#0b1220] px-2">

                                  {/* LONG */}

                                  <button className="flex h-[32px] w-[68px] items-center justify-center rounded-[10px] bg-emerald-500 text-[10px] font-black uppercase tracking-[0.08em] text-white transition-all">

                                    Long
                                  </button>

                                  {/* SHORT */}

                                  <button className="flex h-[32px] w-[68px] items-center justify-center rounded-[10px] bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.08em] text-slate-400 transition-all hover:bg-white/[0.08]">

                                    Short
                                  </button>
                                </div>

                              ) : (

                                <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

                                  <span className="text-[18px] text-slate-500">

                                    {field === "Ticker" && "Enter ticker..."}

                                    {field === "Trade Date" && "Select date..."}

                                    {field === "Quantity" && "Enter qty..."}

                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* ================================================= */}
                        {/* GAP */}
                        {/* ================================================= */}

                        <div className="h-10 opacity-0">
                          spacing
                        </div>

                        {/* ================================================= */}
                        {/* ROW 3 */}
                        {/* ================================================= */}

                        <div className="flex items-start justify-center gap-4">

                          {[
                            "Entry Price",
                            "Exit Price",
                            "PnL",
                            "Commission",
                          ].map((field) => (

                            <div
                              key={field}
                              className="flex flex-col items-center"
                            >

                              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                {field}
                              </p>

                              <div className="flex h-[60px] w-[150px] items-center justify-center rounded-[16px] border border-white/[0.06] bg-[#0b1220]">

                                <span className="text-[18px] text-slate-500">
                                  Enter value...
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* RIGHT SAFE ZONE */}
                    {/* ================================================= */}

                    <div className="w-[18px] shrink-0 opacity-0">
                      spacing
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* BOTTOM RHYTHM */}
                  {/* ================================================= */}

                  <div className="h-6 opacity-0">
                    spacing
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* BOTTOM SAFE ZONE */}
              {/* ================================================= */}

              <div className="h-5 opacity-0">
                spacing
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT SAFE ZONE */}
          {/* ================================================= */}

          <div className="w-[18px] opacity-0">
            spacing
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM SAFE ZONE */}
        {/* ================================================= */}

        <div className="h-[18px] opacity-0">
          spacing
        </div>
      </div>
    </>
  );
}