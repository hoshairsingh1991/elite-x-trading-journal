"use client";

import Sidebar from "@/components/layout/Sidebar";

import { useEffect, useRef, useState } from "react";

import { loadExpenses } from "@/lib/storage/supabaseExpenseStorage";
import type { Expense } from "@/lib/types/expense";

import { Trade } from "@/types/trade";

import {
  loadTradesForAnalytics,
} from "@/lib/trades/loadTradesForAnalytics";

import {
  generatePerformanceBreakdownAnalytics,
} from "@/lib/analytics/performanceBreakdownAnalytics";

import {
  calculateAnnualForecast,
} from "@/lib/analytics/annualForecastAnalytics";

import {
  generateBusinessCostAnalytics,
  generateBusinessIntelligenceMetrics,
} from "@/lib/analytics/businessCostAnalytics";

import {
  convertTradesToReportingCurrency,
} from "@/lib/fx/convertTradesToReportingCurrency";

import {
  loadProfile,
} from "@/lib/storage/profileStorage";

import {
  convertExpensesToReportingCurrency,
} from "@/lib/fx/convertExpensesToReportingCurrency";

import { generateRecurringOccurrences }
from "@/lib/expenses/generateRecurringOccurrences";

import {
  getFxRates,
  FxRates,
  FALLBACK_RATES,
} from "@/lib/fx/fxRateProvider";

import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpenseKpiGrid from "@/components/expenses/ExpenseKpiGrid";
import ExpensesOverviewSection from "@/components/expenses/ExpensesOverviewSection";
import ManualExpensesTable from "@/components/expenses/ManualExpensesTable";
import ExpensesIntelligenceSection from "@/components/expenses/ExpensesIntelligenceSection";
import TaxDeductibleSummary from "@/components/expenses/TaxDeductibleSummary";
import AddExpenseDrawer from "@/components/expenses/AddExpenseDrawer";
import ExportExpenseDrawer from "@/components/expenses/ExportExpenseDrawer";

export default function ExpensePage() {

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [
  isExportDrawerOpen,
  setIsExportDrawerOpen,
] = useState(false);


const [editingExpense, setEditingExpense] =
  useState<Expense | null>(null);

  const [viewOnly, setViewOnly] =
  useState(false);

const [expenses, setExpenses] =
  useState<Expense[]>([]);

  const [trades, setTrades] =
  useState<Trade[]>([]);

  const [
  reportingCurrency,
  setReportingCurrency,
] = useState("USD");

const [
  reportOwner,
  setReportOwner,
] = useState("Elite X User");

const [
  fxRates,
  setFxRates,
] = useState<FxRates>(
  FALLBACK_RATES
);

const [
  selectedPreset,
  setSelectedPreset,
] = useState("All Time");

const [
  startDate,
  setStartDate,
] = useState<Date | null>(null);

const [
  endDate,
  setEndDate,
] = useState<Date | null>(null);

const expenseDateInitialized =
  useRef(false);

const reloadExpenses = async () => {
  const data = await loadExpenses();
  setExpenses(data);
};

const reloadTrades = async () => {

  const data =
    await loadTradesForAnalytics();

  setTrades(data);
};

const catchUpRecurringExpenses =
  async (
    loadedExpenses: Expense[]
  ) => {

    for (const expense of loadedExpenses) {

      if (
        expense.is_recurring &&
        !expense.is_generated &&
        !expense.is_deleted &&
        expense.is_active
      ) {


        await generateRecurringOccurrences(
          expense
        );
      }
    }
  };

useEffect(() => {

  async function initializePage() {

    const loadedExpenses =
      await loadExpenses();

    await catchUpRecurringExpenses(
      loadedExpenses
    );

const refreshedExpenses =
  await loadExpenses();

setExpenses(
  refreshedExpenses
);

const profile =
  await loadProfile();

if (profile) {

  setReportOwner(
    profile.display_name
  );

}

await reloadTrades();
  }

  void initializePage();

}, []);

useEffect(() => {

  const savedCurrency =
    localStorage.getItem(
      "reportingCurrency"
    );

  if (savedCurrency) {

    setReportingCurrency(
      savedCurrency
    );
  }

}, []);

useEffect(() => {

  async function loadFxRates() {

    const rates =
      await getFxRates();

    setFxRates(
      rates
    );
  }

  loadFxRates();

}, []);

useEffect(() => {

  const savedFilter =
    localStorage.getItem(
      "expensesDateFilter"
    );

  if (!savedFilter) {
    return;
  }

  const parsed =
    JSON.parse(savedFilter);

  setSelectedPreset(
    parsed.selectedPreset ??
      "All Time"
  );

  setStartDate(
    parsed.startDate
      ? new Date(
          parsed.startDate
        )
      : null
  );

  setEndDate(
    parsed.endDate
      ? new Date(
          parsed.endDate
        )
      : null
  );

}, []);

useEffect(() => {

  if (!expenseDateInitialized.current) {
    expenseDateInitialized.current = true;
    return;
  }

  localStorage.setItem(
    "expensesDateFilter",
    JSON.stringify({
      selectedPreset,
      startDate,
      endDate,
    })
  );

}, [
  selectedPreset,
  startDate,
  endDate,
]);

const reportingTrades =
  convertTradesToReportingCurrency(
    trades,
    reportingCurrency,
    fxRates
  );



const reportingExpenses =
  convertExpensesToReportingCurrency(
    expenses,
    reportingCurrency,
    fxRates
  );

  const annualForecast =
  calculateAnnualForecast(
    reportingExpenses
  );



const filteredExpenses =
  reportingExpenses.filter(
    expense => {

      if (
        !startDate ||
        !endDate
      ) {
        return true;
      }

      const expenseDate =
        new Date(
          expense.expense_date +
          "T12:00:00"
        );

      return (
        expenseDate >= startDate &&
        expenseDate <= endDate
      );
    }
  );

const filteredTrades =
  reportingTrades.filter(
    trade => {

      if (
        !startDate ||
        !endDate
      ) {
        return true;
      }

      const tradeDate =
        new Date(
          trade.date +
          "T12:00:00"
        );

      return (
        tradeDate >= startDate &&
        tradeDate <= endDate
      );
    }
  );

const performanceBreakdownAnalytics =
  generatePerformanceBreakdownAnalytics(
    filteredTrades
  );

const businessCostAnalytics =
  generateBusinessCostAnalytics(
    filteredExpenses,
    filteredTrades,
    performanceBreakdownAnalytics.netTradingPnL
  );

  const businessIntelligenceMetrics =
  generateBusinessIntelligenceMetrics(
    filteredExpenses,
    filteredTrades,
    performanceBreakdownAnalytics.netTradingPnL
  );


  return (
    <main className="flex h-screen overflow-x-hidden overflow-y-hidden bg-[#020817]">
      {/* Sidebar */}
      <div className="p-4">
        <Sidebar />
      </div>

     {/* Main Content */}
<section className="flex min-w-0 flex-1 flex-col overflow-hidden pt-4 pr-10">
  <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Approved Dashboard-style width wrapper */}
          
<div className="flex justify-center">
  <div className="w-[98%]">
    {/* Top Spacer */}
    <div className="h-3" />

{/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<div className="relative z-[1000]">
<ExpensesHeader
  reportingCurrency={
    reportingCurrency
  }

  selectedPreset={
    selectedPreset
  }

onDateRangeChange={(
  preset,
  start,
  end
) => {

  setSelectedPreset(
    preset
  );

  setStartDate(
    start
  );

  setEndDate(
    end
  );
}}

onExport={() => {
  setIsExportDrawerOpen(true);
}}
/>
</div>

<div className="h-4" />

{/* ================================================= */}
{/* KPI GRID */}
{/* ================================================= */}

<div className="relative z-10 mt-10">
<ExpenseKpiGrid
  expenses={filteredExpenses}
  businessCostAnalytics={businessCostAnalytics}
  netTradingPnL={
    performanceBreakdownAnalytics.netTradingPnL
  }
  reportingCurrency={reportingCurrency}
/>
</div>

<div className="h-0" />

{/* ================================================= */}
{/* BUSINESS INTELLIGENCE */}
{/* ================================================= */}

<div className="relative z-10 mt-8">
<ExpensesIntelligenceSection
  expenses={reportingExpenses}
  metrics={businessIntelligenceMetrics}
  annualForecast={annualForecast}
  reportingCurrency={reportingCurrency}
/>
</div>

<div className="h-2" />

{/* ================================================= */}
{/* EXPENSES OVERVIEW */}
{/* ================================================= */}

<div className="relative z-0 mt-8">
<ExpensesOverviewSection
 expenses={filteredExpenses}
trades={filteredTrades}
  businessCostAnalytics={
    businessCostAnalytics
  }
  reportingCurrency={
    reportingCurrency
  }
/>
</div>

<div className="h-4" />

{/* ================================================= */}
{/* MANUAL EXPENSES + TAX SUMMARY */}
{/* ================================================= */}

<div className="pb-10">
  <div className="grid grid-cols-12 gap-6">
    {/* Left */}
    <div className="col-span-9">
<ManualExpensesTable
  expenses={expenses}
  reportingCurrency={
    reportingCurrency
  }
  fxRates={
    fxRates
  }
  onAddExpense={() => {
    setViewOnly(false);
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  }}
  onEditExpense={(expense) => {
    setViewOnly(false);
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  }}
  onViewExpense={(expense) => {
    setViewOnly(true);
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  }}
  onExpensesChanged={reloadExpenses}
/>
    </div>

    {/* Right */}
    <div className="col-span-3">
<TaxDeductibleSummary
  expenses={filteredExpenses}
  reportingCurrency={
    reportingCurrency
  }
/>
    </div>

    <div className="h-0" />
  </div>
</div>
  </div>
</div>
        </div>
      </section>

<ExportExpenseDrawer
  open={isExportDrawerOpen}
  onClose={() => {
    setIsExportDrawerOpen(false);
  }}

  expenses={reportingExpenses}

  reportingCurrency={reportingCurrency}


  generatedBy={reportOwner}

  reportVersion="1.0"
/>
<AddExpenseDrawer
  open={isAddExpenseOpen}
  onClose={() => {
    setEditingExpense(null);
    setViewOnly(false);
    setIsAddExpenseOpen(false);
  }}
  onSaveSuccess={() => {
    setEditingExpense(null);
    setViewOnly(false);
    void reloadExpenses();
  }}
  onEdit={() => {
    setViewOnly(false);
  }}
  editingExpense={editingExpense}
  viewOnly={viewOnly}
/>
    </main>
  );
}