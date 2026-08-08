"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";

import {
  loadTaxProfile,
  saveTaxProfile,
} from "@/lib/storage/supabaseTaxProfileStorage";

import EliteSelect, {
  EliteSelectOption,
} from "@/components/ui/EliteSelect";

import CurrencyFlag from "@/components/ui/CurrencyFlag";

// ==========================================
// TYPES
// ==========================================

interface TaxSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ==========================================
// HEADER
// ==========================================

const headerPaddingX = "px-7";
const headerPaddingTop = "pt-6";
const headerPaddingBottom = "pb-5";

const titleX = "translate-x-2";
const titleY = "translate-y-2";

const subtitleX = "translate-x-2";
const subtitleY = "translate-y-2";

const closeButtonX = "-translate-x-2";
const closeButtonY = "translate-y-2";

const titleSize = "text-[20px]";
const subtitleSize = "text-[12px]";

const closeButtonSize = "h-8 w-8";
const closeIconSize = 20;

const headerDividerY = "translate-y-2";

// ==========================================
// TAX PROFILE SECTION
// ==========================================

const taxProfileSectionX = "translate-x-0";
const taxProfileSectionY = "translate-y-0";

const taxProfileHeaderX = "translate-x-3";
const taxProfileHeaderY = "translate-y-4";

const countryX = "translate-x-3";
const countryY = "translate-y-6";
const countryWidth = "w-full";
const countryHeight = "h-[40px]";

const provinceX = "translate-x-3";
const provinceY = "translate-y-8";
const provinceWidth = "w-full";
const provinceHeight = "h-[40px]";

const entityTypeX = "translate-x-3";
const entityTypeY = "translate-y-10";
const entityTypeWidth = "w-full";
const entityTypeHeight = "h-[40px]";

const taxRateX = "translate-x-3";
const taxRateY = "translate-y-12";
const taxRateWidth = "w-full";
const taxRateHeight = "h-[40px]";

const taxYearX = "translate-x-3";
const taxYearY = "translate-y-14";
const taxYearWidth = "w-full";
const taxYearHeight = "h-[40px]";

// ==========================================
// PREVIEW CARD
// ==========================================

const previewCardX = "translate-x-3";
const previewCardY = "translate-y-16";

// ==========================================
// ADVANCED SETTINGS
// ==========================================

const advancedDividerY = "translate-y-18";

const advancedHeaderX = "translate-x-3";
const advancedHeaderY = "translate-y-20";

const advancedCardX = "translate-x-3";
const advancedCardY = "translate-y-22";

// ==========================================
// FOOTER
// ==========================================

const footerX = "translate-x-0";
const footerY = "-translate-y-4";

const cancelButtonX = "translate-x-12";
const cancelButtonY = "translate-y-2";
const cancelButtonWidth = "w-[80px]";
const cancelButtonHeight = "h-10";

const saveButtonX = "translate-x-12";
const saveButtonY = "translate-y-2";
const saveButtonWidth = "w-[120px]";
const saveButtonHeight = "h-10";

// ==========================================
// OPTIONS
// ==========================================

const CANADA_PROVINCES = [
  "Ontario",
  "Alberta",
  "British Columbia",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];

const US_STATES = [
  "California",
  "Texas",
  "Florida",
  "New York",
  "Washington",
  "Nevada",
  "Illinois",
  "Arizona",
  "Georgia",
  "North Carolina",
];

const currentYear =
  new Date().getFullYear();

const taxYears =
  Array.from(
    { length: 11 },
    (_, i) =>
      currentYear - 5 + i
  );

const COUNTRY_OPTIONS: EliteSelectOption[] = [
  {
    value: "Canada",
    label: "Canada",
    icon: (
      <CurrencyFlag currency="CAD" />
    ),
  },
  {
    value: "United States",
    label: "United States",
    icon: (
      <CurrencyFlag currency="USD" />
    ),
  },
  {
    value: "Other",
    label: "Other",
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function TaxSettingsDrawer({
  open,
  onClose,
  onSaved,
}: TaxSettingsDrawerProps) {
  const [country, setCountry] =
    useState("Canada");

  const [countryCode, setCountryCode] =
    useState("CA");

  const [province, setProvince] =
    useState("Ontario");

  const [entityType, setEntityType] =
    useState("Individual");

  const [taxRate, setTaxRate] =
    useState(30);

  const [taxYear, setTaxYear] =
    useState(2026);

    const PROVINCE_OPTIONS: EliteSelectOption[] =
  (
    country === "Canada"
      ? CANADA_PROVINCES
      : US_STATES
  ).map((item) => ({
    value: item,
    label: item,
  }));

  const ENTITY_TYPE_OPTIONS: EliteSelectOption[] = [
  {
    value: "Individual",
    label: "Individual",
  },
  {
    value: "Sole Proprietorship",
    label: "Sole Proprietorship",
  },
  {
    value: "Corporation",
    label: "Corporation",
  },
  {
    value: "Partnership",
    label: "Partnership",
  },
  {
    value: "Trust",
    label: "Trust",
  },
  {
    value: "Other",
    label: "Other",
  },
];

const TAX_YEAR_OPTIONS: EliteSelectOption[] =
  taxYears.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchProfile() {
      try {
        setLoading(true);

        const profile =
          await loadTaxProfile();

        if (!profile) return;

        setCountry(
          profile.country ?? "Canada"
        );

        setCountryCode(
          profile.country_code ?? "CA"
        );

        setProvince(
          profile.province ?? "Ontario"
        );

        setEntityType(
          profile.entity_type ??
            "Individual"
        );

        setTaxRate(
          Number(
            profile.tax_rate ?? 30
          )
        );

        setTaxYear(
          Number(
            profile.tax_year ?? 2026
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [open]);

  async function handleSave() {
  try {
    setSaving(true);

    await saveTaxProfile({
      country,
      country_code: countryCode,
      province,
      entity_type: entityType,
      tax_rate: Number(taxRate),
      tax_year: Number(taxYear),
    });

    onSaved();
    onClose();
  } catch (error) {
    console.error(error);
  } finally {
    setSaving(false);
  }
}

function handleReset() {
  setCountry("Canada");

  setCountryCode("CA");

  setProvince("Ontario");

  setEntityType("Individual");

  setTaxRate(30);

  setTaxYear(
    new Date().getFullYear()
  );
}

  const inputCenter =
    "h-[40px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-center placeholder:text-center text-sm text-white placeholder:text-slate-500 outline-none";

  const label =
    "mb-2.5 block text-[14px] font-medium text-slate-200";

  const estimatedSavings =
    (1000 * Number(taxRate || 0)) /
    100;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[9999] h-screen w-[380px] max-w-[96vw] border-l border-white/10 bg-[#07111d] transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

{/* HEADER */}

<div
  className={`${headerPaddingX} ${headerPaddingTop} ${headerPaddingBottom}`}
>
  <div className="flex items-start justify-between">
    <div>
      <h2
        className={`${titleSize} font-bold leading-none tracking-tight text-white transform ${titleX} ${titleY}`}
      >
        Tax Settings
      </h2>

      <p
        className={`mt-2 ${subtitleSize} text-slate-400 transform ${subtitleX} ${subtitleY}`}
      >
        Configure tax profile assumptions
      </p>
    </div>

    <div
      className={`transform ${closeButtonX} ${closeButtonY}`}
    >
      <button
        onClick={onClose}
        className={`flex ${closeButtonSize} items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-slate-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white`}
      >
        <X size={closeIconSize} />
      </button>
    </div>
  </div>
</div>

<div
  className={`border-b border-white/10 transform ${headerDividerY}`}
/>

<div className="flex-1 overflow-y-auto">
  <div className="mx-auto w-[95%] px-5 py-6">

<section
  className={`mb-10 transform ${taxProfileSectionX} ${taxProfileSectionY}`}
>
  <h3
    className={`mb-6 text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400 transform ${taxProfileHeaderX} ${taxProfileHeaderY}`}
  >
    Tax Profile
  </h3>
{/* COUNTRY */}

<div
  className={`mb-5 transform ${countryX} ${countryY}`}
>
  <label className={label}>
    Country
  </label>

  <EliteSelect
  variant="form"
    value={country}
    options={COUNTRY_OPTIONS}
    onChange={(value) => {
      setCountry(value);

      if (value === "Canada") {
        setCountryCode("CA");
        setProvince("Ontario");
      } else if (
        value === "United States"
      ) {
        setCountryCode("US");
        setProvince("California");
      } else {
        setCountryCode("OTHER");
        setProvince("");
      }
    }}
    width={countryWidth}
    iconYOffset="translate-y-1"
  />
</div>

{/* PROVINCE / STATE */}

<div
  className={`mb-5 transform ${provinceX} ${provinceY}`}
>
  <label className={label}>
    Province / State
  </label>

{country === "Other" ? (
  <input
    value={province}
    onChange={(e) =>
      setProvince(e.target.value)
    }
    className={`${inputCenter} ${provinceWidth} ${provinceHeight}`}
    placeholder="Enter region or state"
  />
) : (
  <EliteSelect
    variant="form"
    value={province}
    options={PROVINCE_OPTIONS}
    onChange={setProvince}
    width={provinceWidth}
    iconYOffset="translate-y-1"
  />
)}
</div>

{/* ENTITY TYPE */}

<div
  className={`mb-5 transform ${entityTypeX} ${entityTypeY}`}
>
  <label className={label}>
    Tax Entity Type
  </label>

<EliteSelect
  variant="form"
  value={entityType}
  options={ENTITY_TYPE_OPTIONS}
  onChange={setEntityType}
  width={entityTypeWidth}
  iconYOffset="translate-y-1"
/>
</div>

{/* TAX RATE */}

<div
  className={`mb-5 transform ${taxRateX} ${taxRateY}`}
>
  <label className={label}>
    Marginal Tax Rate
  </label>

  <div className="relative">
    <input
      type="number"
      min="0"
      max="100"
      step="0.01"
      value={taxRate}
      onChange={(e) =>
        setTaxRate(
          Number(
            e.target.value
          )
        )
      }
      className={`${inputCenter} ${taxRateWidth} ${taxRateHeight}`}
      placeholder="30"
    />

    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
      %
    </span>
  </div>

  <p className="mt-3 text-xs text-slate-500">
    Used to estimate tax
    savings from deductible
    expenses.
  </p>
  <div className="mt-3 flex gap-2">
  {[20, 30, 40, 50].map((rate) => (
    <button
      key={rate}
      type="button"
      onClick={() =>
        setTaxRate(rate)
      }
      className={`h-[36px] w-[70px] rounded-lg border text-xs font-medium transition-all ${
  taxRate === rate
    ? "border-blue-500 bg-blue-500/15 text-blue-300"
    : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
}`}
    >
      {rate}%
    </button>
  ))}
</div>
</div>

  {/* TAX YEAR */}

  <div
    className={`mb-5 transform ${taxYearX} ${taxYearY}`}
  >
    <label className={label}>
      Tax Year
    </label>

  <EliteSelect
    variant="form"
    value={String(taxYear)}
    options={TAX_YEAR_OPTIONS}
    onChange={(value) =>
      setTaxYear(Number(value))
    }
    width={taxYearWidth}
  iconYOffset="translate-y-1"
  />
  </div>

  </section>



  {/* BOTTOM SPACER */}

<div className="h-8" />

{/* CLOSE BODY WRAPPER */}

</div>

{/* CLOSE SCROLLABLE BODY */}

</div>

{/* FOOTER */}

<div
  className={`border-t border-white/10 bg-[#07111d] px-8 py-5 transform ${footerX} ${footerY}`}
>
  <div className="flex gap-4">
  <div
    className={`transform ${cancelButtonX} ${cancelButtonY}`}
  >
    <button
      onClick={onClose}
      className={`${cancelButtonWidth} ${cancelButtonHeight} rounded-xl border border-white/10 text-white text-[14px] transition-all duration-200 hover:bg-white/[0.04]`}
    >
      Cancel
    </button>
  </div>

  <div
    className={`transform ${cancelButtonX} ${cancelButtonY}`}
  >
    <button
      type="button"
      onClick={handleReset}
      className="h-10 w-[80px] rounded-xl border border-white/10 text-white text-[14px] transition-all duration-200 hover:bg-white/[0.04]"
    >
      Reset
    </button>
  </div>

  <div
    className={`flex-1 transform ${saveButtonX} ${saveButtonY}`}
  >
      <button
        onClick={handleSave}
        disabled={
          loading || saving
        }
        className={`${saveButtonWidth} ${saveButtonHeight} rounded-xl bg-blue-600 font-semibold text-[14px] text-white transition-all duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {saving
          ? "Saving..."
          : "Save Changes"}
      </button>
    </div>
  </div>
</div>

{/* CLOSE FLEX CONTAINER */}

</div>

</aside>

</>
  );
}