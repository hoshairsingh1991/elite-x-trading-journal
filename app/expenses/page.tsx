"use client";

import Sidebar from "@/components/layout/Sidebar";

import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpenseKpiGrid from "@/components/expenses/ExpenseKpiGrid";
import ExpensesOverviewSection from "@/components/expenses/ExpensesOverviewSection";
import ManualExpensesTable from "@/components/expenses/ManualExpensesTable";
import ExpensesIntelligenceSection from "@/components/expenses/ExpensesIntelligenceSection";

export default function ExpensePage() {
  return (
    <main className="flex min-h-screen bg-[#020817]">
      {/* Sidebar */}
      <div className="p-4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <section className="flex min-w-0 flex-1 flex-col overflow-visible pt-10">
        <div className="flex-1 overflow-visible">
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

{/* ================================================= */}
{/* MANUAL EXPENSES TABLE (TEMP HIDDEN) */}
{/* ================================================= */}

{/*
<div className="mt-8 pb-10">
  <ManualExpensesTable />
</div>
*/}
  </div>
</div>
        </div>
      </section>
    </main>
  );
}