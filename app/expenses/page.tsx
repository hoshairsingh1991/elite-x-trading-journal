"use client";

import Sidebar from "@/components/layout/Sidebar";

import { useEffect, useState } from "react";

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
  generateBusinessCostAnalytics,
} from "@/lib/analytics/businessCostAnalytics";

import {
  convertTradesToReportingCurrency,
} from "@/lib/fx/convertTradesToReportingCurrency";

import {
  convertExpensesToReportingCurrency,
} from "@/lib/fx/convertExpensesToReportingCurrency";

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

export default function ExpensePage() {

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);


const [editingExpense, setEditingExpense] =
  useState<Expense | null>(null);

const [expenses, setExpenses] =
  useState<Expense[]>([]);

  const [trades, setTrades] =
  useState<Trade[]>([]);

  const [
  reportingCurrency,
  setReportingCurrency,
] = useState("USD");

const [
  fxRates,
  setFxRates,
] = useState<FxRates>(
  FALLBACK_RATES
);

const reloadExpenses = async () => {
  const data = await loadExpenses();
  setExpenses(data);
};

const reloadTrades = async () => {

  const data =
    await loadTradesForAnalytics();

  setTrades(data);
};

useEffect(() => {

  void reloadExpenses();
  void reloadTrades();

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

const performanceBreakdownAnalytics =
  generatePerformanceBreakdownAnalytics(
    reportingTrades
  );

const businessCostAnalytics =
  generateBusinessCostAnalytics(
    expenses,
    reportingTrades,
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
    <div className="h-6" />

{/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<div className="relative z-[1000]">
  <ExpensesHeader
  reportingCurrency={
    reportingCurrency
  }
/>
</div>

<div className="h-6" />

{/* ================================================= */}
{/* KPI GRID */}
{/* ================================================= */}

<div className="relative z-10 mt-10">
  <ExpenseKpiGrid
    expenses={reportingExpenses}
    businessCostAnalytics={
      businessCostAnalytics
    }
    reportingCurrency={
      reportingCurrency
    }
  />
</div>

<div className="h-6" />

{/* ================================================= */}
{/* BUSINESS INTELLIGENCE */}
{/* ================================================= */}

<div className="relative z-10 mt-8">
  <ExpensesIntelligenceSection
  expenses={expenses}
/>
</div>

<div className="h-6" />

{/* ================================================= */}
{/* EXPENSES OVERVIEW */}
{/* ================================================= */}

<div className="relative z-0 mt-8">
  <ExpensesOverviewSection
  expenses={expenses}
/>
</div>

<div className="h-6" />

{/* ================================================= */}
{/* MANUAL EXPENSES + TAX SUMMARY */}
{/* ================================================= */}

<div className="pb-10">
  <div className="grid grid-cols-12 gap-6">
    {/* Left */}
    <div className="col-span-9">
<ManualExpensesTable
  expenses={expenses}
  onAddExpense={() => {
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  }}
  onEditExpense={(expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  }}
  onExpensesChanged={reloadExpenses}
/>
    </div>

    {/* Right */}
    <div className="col-span-3">
      <TaxDeductibleSummary
  expenses={expenses}
/>
    </div>

    <div className="h-0" />
  </div>
</div>
  </div>
</div>
        </div>
      </section>
<AddExpenseDrawer
  open={isAddExpenseOpen}
  onClose={() => {
    setEditingExpense(null);
    setIsAddExpenseOpen(false);
  }}
onSaveSuccess={() => {
  setEditingExpense(null);
  void reloadExpenses();
}}
  editingExpense={editingExpense}
/>
    </main>
  );
}