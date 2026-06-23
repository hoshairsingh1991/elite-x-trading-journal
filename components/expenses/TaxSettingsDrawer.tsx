"use client";

import { useEffect, useState } from "react";

import {
  TaxProfile,
} from "@/lib/types/taxProfile";

import {
  loadTaxProfile,
  saveTaxProfile,
} from "@/lib/storage/supabaseTaxProfileStorage";

interface TaxSettingsDrawerProps {
  open: boolean;

  onClose: () => void;

  onSaved: () => void;
}

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
          profile.country
        );

        setCountryCode(
          profile.country_code
        );

        setProvince(
          profile.province
        );

        setEntityType(
          profile.entity_type
        );

        setTaxRate(
          profile.tax_rate
        );

        setTaxYear(
          profile.tax_year
        );

      } catch (error) {

        console.error(
          "Failed to load tax profile:",
          error
        );

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

        tax_rate: taxRate,

        tax_year: taxYear,
      });

      onSaved();
      onClose();

    } catch (error) {

      console.error(
        "Failed to save tax profile:",
        error
      );

    } finally {

      setSaving(false);

    }
  }

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
      className={`fixed right-0 top-0 z-[9999] h-screen w-[500px] max-w-[96vw] border-l border-white/10 bg-[#0B1220] transition-transform duration-300 ${
        open
          ? "translate-x-0"
          : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div>
          <div className="text-lg font-semibold text-white">
            Tax Settings
          </div>

          <div className="mt-1 text-sm text-slate-400">
            Configure tax profile assumptions
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5"
        >
          Close
        </button>
      </div>

            <div className="p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm text-slate-400">
            Country
          </div>

          <div className="mt-2 text-white">
            {country}
          </div>
        </div>
      </div>
    </aside>
  </>
);
}