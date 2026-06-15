"use client";

import Sidebar from "@/components/layout/Sidebar";

import { useState } from "react";

import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpenseKpiGrid from "@/components/expenses/ExpenseKpiGrid";
import ExpensesOverviewSection from "@/components/expenses/ExpensesOverviewSection";
import ManualExpensesTable from "@/components/expenses/ManualExpensesTable";
import ExpensesIntelligenceSection from "@/components/expenses/ExpensesIntelligenceSection";
import TaxDeductibleSummary from "@/components/expenses/TaxDeductibleSummary";
import AddExpenseDrawer from "@/components/expenses/AddExpenseDrawer";

export default function ExpensePage() {

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [refreshKey, setRefreshKey] =
  useState(0);

  const [editingExpense, setEditingExpense] =
  useState<any | null>(null);

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
  <ExpensesHeader />
</div>

<div className="h-6" />

{/* ================================================= */}
{/* KPI GRID */}
{/* ================================================= */}

<div className="relative z-10 mt-10">
  <ExpenseKpiGrid />
</div>

<div className="h-6" />

{/* ================================================= */}
{/* BUSINESS INTELLIGENCE */}
{/* ================================================= */}

<div className="relative z-10 mt-8">
  <ExpensesIntelligenceSection />
</div>

<div className="h-6" />

{/* ================================================= */}
{/* EXPENSES OVERVIEW */}
{/* ================================================= */}

<div className="relative z-0 mt-8">
  <ExpensesOverviewSection />
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
  onAddExpense={() => {
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  }}
  onEditExpense={(expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  }}
  refreshKey={refreshKey}
/>
    </div>

    {/* Right */}
    <div className="col-span-3">
      <TaxDeductibleSummary />
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
  setRefreshKey((prev) => prev + 1);
}}
  editingExpense={editingExpense}
/>
    </main>
  );
}