"use client";

import ReactCountryFlag from "react-country-flag";

type CurrencyFlagProps = {
  currency: string;
};

const COUNTRY_CODES: Record<string, string> = {
  USD: "us",
  CAD: "ca",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  INR: "in",
};

export default function CurrencyFlag({
  currency,
}: CurrencyFlagProps) {

  const countryCode =
    COUNTRY_CODES[
      currency.toUpperCase()
    ];

  if (!countryCode) {
    return (
     <div
  className="
    h-[12px]
    w-[16px]
    shrink-0
    rounded-[2px]
    bg-slate-700
  "
/>
    );
  }

return (
  <ReactCountryFlag
    countryCode={countryCode.toUpperCase()}
    svg
    style={{
      width: "16px",
      height: "12px",
      flexShrink: 0,
      borderRadius: "2px",
    }}
  />
);

}