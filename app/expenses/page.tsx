"use client";

import Sidebar from "@/components/layout/Sidebar";

import ExpensesHeader from "@/components/expenses/ExpensesHeader";
import ExpenseKpiGrid from "@/components/expenses/ExpenseKpiGrid";
import ExpensesOverviewSection from "@/components/expenses/ExpensesOverviewSection";
import ManualExpensesTable from "@/components/expenses/ManualExpensesTable";


export default function ExpensePage() {
  return (
    <main className="flex min-h-screen overflow-hidden bg-[#020817]">
      {/* Sidebar */}
      <div className="p-4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden pt-10">
        <div className="flex-1 overflow-y-auto">
          {/* Approved Dashboard-style width wrapper */}
          
<div className="flex justify-center">
  <div className="w-[98%]">
    {/* Top Spacer */}
    <div className="h-6" />

    <ExpensesHeader />
<div className="h-6" />


{/* ================================================= */}
{/* KPI GRID */}
{/* ================================================= */}

<div className="mt-10">
  <ExpenseKpiGrid />
</div>
<div className="h-6" />

{/* ================================================= */}
{/* EXPENSES OVERVIEW */}
{/* ================================================= */}

<div className="mt-8">
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